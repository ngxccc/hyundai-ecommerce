# 11. Grafana k6 Load Testing Architecture & Concurrency Verification Suite

Date: 2026-08-28
Deciders: Team / Core Architecture

### Metadata

- **ID**: `ADR-0011`
- **Status**: `Accepted`
- **Date**: `2026-08-28`
- **Feature**: `booking`
- **Topic**: `Grafana k6 High-Concurrency Stress Testing, Token Distribution, and Rate Limit Isolation`
- **Target Module**: `test/load/`, `src/modules/booking/` & `.github/workflows/`

---

## Status

Accepted

---

## Context

Issue #57 requires establishing an automated Grafana k6 load and stress testing suite specifically targeting the high-concurrency seat reservation endpoint (`POST /bookings/reserve`) under 500 to 2,000 Virtual Users (VUs) bursting within a 5-second window.

Simulating mass contention on a single shared VIP seat (Hot Seat Contention) in an automated test environment introduces four core engineering challenges:

1. **Authentication Token Bottleneck at Scale**:
   `POST /bookings/reserve` requires a valid JWT Bearer token with `@CurrentUser('sub')`. If 2,000 VUs login over HTTP (`POST /auth/login`) inside k6, the CPU-intensive password hashing algorithms (Scrypt/Argon2/Bcrypt) will max out CPU cores at the Auth layer before requests reach the Booking module (False Bottleneck). Conversely, having 2,000 VUs share a single JWT token violates real-world semantics and triggers false idempotency collisions.
2. **Rate Limiting Guard vs. Concurrency Verification Collision**:
   `CustomThrottlerGuard` enforces IP-based rate limiting (`@Throttle({ default: { limit: 10, ttl: 60000 } })`). When running k6 from a single test runner, all 2,000 VUs originate from `127.0.0.1`. In production mode, request #11 onwards would receive `HTTP 429 Too Many Requests`, blocking requests from ever reaching the Redlock and PostgreSQL `SELECT ... FOR UPDATE` layers and preventing verification of double-booking integrity.
3. **State Mutation and Test Data Lifecycle**:
   Seat reservations mutate state (`show_seats.status = 'reserved'`). Subsequent test runs on the same show will fail with 100% 409 responses unless clean data fixtures and deterministic teardown are provisioned before and after each run.
4. **CI/CD Pipeline Execution Economics**:
   Running a full 2,000-VU stress test on every PR commit creates long feedback loops and causes false-positive latency failures due to virtualized CPU jitter on shared GitHub Actions runners.

---

## Decision

We decided to establish a 4-tier Load & Stress Testing Architecture:

1. **Pre-Generated Token Pool with `k6/data` (`SharedArray`)**:
   - A TypeScript setup script (`test/load/seed.ts`) executed via Bun seeds test data and pre-generates 500–2,000 unique user accounts directly into PostgreSQL.
   - Signs $N$ valid JWT access tokens offline using the project's `JWT_SECRET` and writes a compact fixture file (`test/load/fixtures/booking-fixtures.json`).
   - The k6 script loads this file once in the `init` context using `SharedArray`, sharing memory read-only across all Goja JS runtimes with zero RAM duplication and zero Auth HTTP overhead.
2. **Multi-Scenario Architecture (Lock Contention vs. Rate Limiting)**:
   - **Scenario 1: `hot_seat_burst` (High-Concurrency Lock Contention)**:
     - Uses `per-vu-iterations` executor (`vus: ${VUS:-500}`, `iterations: 1`, `maxDuration: "10s"`).
     - Each VU injects a unique client IP via `X-Forwarded-For: 10.0.${Math.floor(__VU/256)}.${__VU%256}` (honored by `app.set('trust proxy', 1)`).
     - Generates UUIDv7 idempotency keys per request using `uuid` package.
     - **Invariants**: Exactly 1 request receives `HTTP 201 Created`, exactly $N-1$ requests receive `HTTP 409 Conflict`, and 0 unhandled `HTTP 500` server errors.
   - **Scenario 2: `rate_limit_abuse` (Throttler Rate Limiting Verification)**:
     - Uses `per-vu-iterations` executor with 1 VU sending 30 rapid requests from a single static IP.
     - **Invariants**: First 10 requests pass, subsequent requests return `HTTP 429 Too Many Requests` formatted according to RFC 9457.
3. **TypeScript-to-JS Bundling Pipeline**:
   - Authors write k6 test suites in TypeScript (`test/load/booking-concurrency.k6.ts`) utilizing strong types from OpenAPI contracts.
   - Test runner bundles TypeScript via `bun build test/load/booking-concurrency.k6.ts --target=browser --outfile dist/load-test.js` in $<50\text{ms}$.
   - Executes via native `k6` binary if present, with automatic fallback to Docker (`grafana/k6:latest`).
4. **Post-Test Invariant Verifier & Cleanup**:
   - `test/load/verify-and-teardown.ts` directly inspects PostgreSQL (`SELECT count(*) FROM bookings`, `show_seats.status`) and Redis locks to mathematically verify zero overselling, then purges test data cleanly.
5. **CI/CD Separation of Concerns**:
   - **PR Verification (`ci.yml`)**: Kept fast and deterministic without running heavy k6 stress tests.
   - **Performance Workflow (`.github/workflows/performance.yml`)**: Dedicated workflow triggered via `workflow_dispatch` (manual pre-release testing with configurable `VUS`) and nightly scheduled cron runs for continuous performance regression tracking.

---

## Consequences

### Positive Consequences

- Guarantees 100% empirical verification of Redlock and PostgreSQL `FOR UPDATE` lock integrity under 500–2,000 concurrent requests.
- Zero memory leakage and zero Auth bottleneck during stress tests via `SharedArray` token caching.
- Isolated test scenarios eliminate false positives between rate limiting (429) and lock contention (409).
- Clean separation between PR feedback speed and deep performance regression auditing in CI/CD.

### Negative Consequences

- Running full 2,000-VU tests locally requires opening 2,000 concurrent TCP sockets (requires reasonable OS `ulimit -n`).
- Scenario 2 (Rate Limiting) requires the SUT server to be executed with `NODE_ENV=production` or Doppler staging config to bypass the dev environment throttler exemption.

---

### Explicit Tradeoffs

- **Offline Token Signing vs HTTP Login**: Offline signing eliminates Auth CPU exhaustion during load tests, sacrificing realistic Auth endpoint traffic in exchange for pure focus on Booking concurrency.
- **`per-vu-iterations` vs `ramping-vus`**: Choosing `per-vu-iterations` forces instantaneous microsecond lock collisions at $t=0$, which is essential for testing race conditions, rather than gradual traffic modeling.
- **Latency Threshold Alignment (ADR 0006)**: Because Redlock is configured with 3 retries ($\sim 600\text{ms}$ delay for micro-collisions per ADR 0006), the $p95$ threshold for pure single-seat contention is configured to $\le 700\text{ms}$ and $p99 \le 800\text{ms}$, reflecting the true architectural behavior.

---

## Decision Drivers

- **Zero Overselling / Double-Booking Guarantee**: Absolute requirement that exactly 1 user books the seat.
- **Observability**: Clear metric tagging and RFC 9457 structured error assertions.
- **Reproducibility**: Predictable seed and teardown lifecycle across local dev, Docker, and CI.

---

## Validation & Verification

- `bun run test:load` executes the 4-step pipeline locally.
- Verified zero double-bookings in database (`bookings` count $= 1$).
- Verified p95 and p99 latency compliance under Grafana k6 summary.
