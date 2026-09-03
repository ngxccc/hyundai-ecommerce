<div align="center">

# Ticket Booking System

### High-Performance & Concurrency-Safe Cinema Ticket Reservation Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NestJS-11.2-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![Bun](https://img.shields.io/badge/Bun-1.4-000000?logo=bun&logoColor=white)](https://bun.sh)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-8.0-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Scalar API Docs](https://img.shields.io/badge/Scalar_UI-OpenAPI_3.1-00B4D8)](https://scalar.com)
[![Sentry](https://img.shields.io/badge/Sentry-Observability-362D59?logo=sentry&logoColor=white)](https://sentry.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Architectural Highlights

- **Concurrency-Safe Dual Locking**: Eliminates double-booking under peak load via Redis **Redlock** distributed locking paired with PostgreSQL pessimistic row locks (`SELECT ... FOR UPDATE`).
- **PostgreSQL GiST Schedule Protection**: Kernel-level schedule collision prevention enforcing a mandatory **15-minute cleaning buffer** between consecutive shows in the same hall (`tsrange` exclusion constraint).
- **1D Flat Timeline & Batch Scheduling**: $O(N)$ sweep-line intra-batch collision detection for recurring show creation with all-or-nothing transactional rollback atomicity.
- **Chunked Seat Pre-Allocation**: Bulk pre-allocates physical seats in 1,000-row chunks as static snapshots (`available`), avoiding PostgreSQL parameter limits and runtime allocation overhead.
- **Transactional Outbox Event Relay**: Decouples database transactions from async tasks (BullMQ + Resend emails) with 5-second polling workers and 10-minute automated seat cleanup.
- **PayOS Webhook & Idempotency**: HMAC-SHA256 signature verification with 5-minute anti-replay windows and Redis-backed `Idempotency-Key` guards.
- **Automated K6 Concurrency Suite**: Multi-scenario stress testing (`hot_seat_burst`, `rate_limit_abuse`) simulating 500-2,000 concurrent VUs with offline JWT signing (`SharedArray`) and post-test DB invariant verification.
- **Enterprise Observability & Zero-Noise Filtering**: Integrated Sentry APM with automated PII masking, 4xx/5xx noise separation, closed-loop RFC 9457 `eventId` propagation, and Outbox dead-letter queue alerting.

---

## System Architecture

```text
ticket-booking/
├── src/                  # NestJS Application Source
│   ├── modules/          # Feature Modules (auth, booking, shows, users, outbox, mail)
│   ├── database/         # Drizzle ORM schemas & connection pool
│   ├── common/           # Global filters, guards, interceptors, constants, Redlock
│   ├── env.ts            # Zod type-safe environment configuration
│   └── main.ts           # Application bootstrap & Scalar UI integration
├── test/                 # Test Suites & Benchmarks
│   ├── integration/      # E2E Integration tests against real PostgreSQL/Redis
│   ├── factories/        # Test data factories & Object Mothers
│   └── benchmarks/       # Automated micro-benchmarking engine
├── drizzle/              # Drizzle SQL Migrations & schema snapshots
└── docs/                 # ADRs, Design Specs & Engineering Standards
```

---

## API Reference

Interactive OpenAPI 3.1 documentation is dynamically served by **Scalar UI**:

- **Interactive API UI**: [http://localhost:3000/reference](http://localhost:3000/reference)
- **OpenAPI 3.1 JSON**: [http://localhost:3000/api-json](http://localhost:3000/api-json)

### Core Endpoints

| Module      | Route                                                                                      | Auth                 | Description                                                                   |
| :---------- | :----------------------------------------------------------------------------------------- | :------------------- | :---------------------------------------------------------------------------- |
| **Auth**    | `POST /auth/register`<br>`POST /auth/login`<br>`POST /auth/refresh`<br>`POST /auth/logout` | Public / Bearer JWT  | Token verification, device-tracked refresh token rotation, global revocation. |
| **Shows**   | `POST /shows`<br>`POST /shows/batch`                                                       | Bearer JWT (`admin`) | Single & recurring batch show creation with GiST 15m cleaning buffer guard.   |
| **Booking** | `POST /bookings/reserve`<br>`POST /bookings/confirm`                                       | Bearer JWT + Header  | Concurrency-safe seat reservation (10m TTL) & PayOS payment confirmation.     |
| **Payment** | `POST /payments/payos-webhook`                                                             | Signature            | PayOS payment webhook with HMAC-SHA256 validation.                            |
| **User**    | `GET /users/me`                                                                            | Bearer JWT           | Authenticated user profile retrieval.                                         |

---

## Quickstart

### Prerequisites

- **Bun** `v1.4+`
- **Docker & Docker Compose** (PostgreSQL 18, Redis 8)
- **Doppler CLI** (Optional, for environment secrets)

### Setup & Run

```bash
# 1. Clone and install dependencies
git clone https://github.com/ngxccc/ticket-booking.git
cd ticket-booking
bun install

# 2. Start PostgreSQL and Redis containers
docker compose up -d

# 3. Apply database migrations & generate i18n types
bun run i18n:generate
bun run db:migrate

# 4. Seed database fixtures (cinemas, halls, movies, relative schedule & show seats)
bun run db:seed

# 5. Start development server
bun run dev
```

Visit `http://localhost:3000/reference` to test API endpoints.

---

## Performance Benchmarks

### 1. High-Concurrency Seat Contention & Stress Testing (`POST /bookings/reserve`)

End-to-end stress testing executed via **Grafana k6** simulating 500 concurrent Virtual Users (VUs) simultaneously competing for the exact same VIP seat at millisecond $t=0$ (`bun run test:load`):

| Test Metric / Invariant              |     Target Threshold      |         Actual Result          |      Verification Status      |
| :----------------------------------- | :-----------------------: | :----------------------------: | :---------------------------: |
| **Hot Seat Contention (VUs)**        |    500 Concurrent VUs     |          **500 VUs**           |       Passed ($100\%$)        |
| **Single Winner**                    |       `count == 1`        |    **1 (HTTP 201 Created)**    |       Exactly 1 Booking       |
| **Conflict Integrity**               |      `count == 499`       |  **499 (HTTP 409 Conflict)**   |       Zero Overselling        |
| **Fatal Server Errors**              |       `count == 0`        |      **0 (0% HTTP 500)**       |   Zero Crashes / Deadlocks    |
| **IP Rate Limiting Abuse**           | Trigger 429 after 10 reqs | **HTTP 429 Too Many Requests** |    DoS Protection Verified    |
| **Latency p50 (Median)**             |    $< 1,200\text{ ms}$    |         `1,151.88 ms`          |       Stable across WAN       |
| **Latency p95**                      |   $\le 1,500\text{ ms}$   |         `1,227.45 ms`          | Aligned with ADR 0006 Backoff |
| **Latency p99**                      |   $\le 2,000\text{ ms}$   |         `1,255.84 ms`          | Aligned with ADR 0006 Backoff |
| **Post-Test Invariant Verification** |   Zero DB/Redis Residue   |    **1,024 / 1,024 checks**    |    All Invariants Verified    |

### 2. Micro-Benchmarks

Micro-benchmarks executed on the Bun runtime measuring latency distribution percentiles and throughput (`bun run test:bench`):

| Benchmark Task                                                                                   | Iterations | Mean Latency |    p50     |    p95     |    p99     |     Throughput     |
| :----------------------------------------------------------------------------------------------- | :--------: | :----------: | :--------: | :--------: | :--------: | :----------------: |
| **ShowsBatch: 90 Slots Expansion &amp; Sort**<br>_(1D Flat Timeline + $O(N)$ sweep-line check)_  |   10,000   |  `0.038 ms`  | `0.035 ms` | `0.046 ms` | `0.059 ms` | **26,476 ops/sec** |
| **ShowsBatch: DB Bulk 100 Shows + 20k Seats**<br>_(All-or-nothing Tx + 1k chunk pre-allocation)_ |     1      |  `2.100 s`   | `2.100 s`  | `2.100 s`  | `2.100 s`  | **9,571 rec/sec**  |

## Environment Configuration

Strictly validated on boot via Zod schema (`src/env.ts`):

| Variable                                       | Required | Default                 | Purpose                                     |
| :--------------------------------------------- | :------- | :---------------------- | :------------------------------------------ |
| `PORT`                                         | No       | `3000`                  | HTTP port                                   |
| `DB_URL`                                       | No       | _Local DSN_             | PostgreSQL connection string                |
| `REDIS_URL`                                    | No       | `localhost:6379`        | Redis connection string                     |
| `JWT_SECRET`                                   | **Yes**  | _None_                  | JWT signing key (min 32 chars)              |
| `JWT_ACCESS_EXPIRES_IN`                        | No       | `15m`                   | Access token TTL                            |
| `JWT_REFRESH_EXPIRES_IN`                       | No       | `7d`                    | Refresh token TTL                           |
| `PAYOS_CLIENT_ID` / `API_KEY` / `CHECKSUM_KEY` | **Yes**  | _None_                  | PayOS merchant credentials                  |
| `RESEND_API_KEY`                               | **Yes**  | _None_                  | Transactional email API key                 |
| `SHOW_CREATION_MIN_LEAD_MINUTES`               | No       | `10`                    | Minimum lead time for scheduling shows      |
| `VUS`                                          | No       | `500`                   | Virtual Users for load testing              |
| `TARGET_URL`                                   | No       | `http://127.0.0.1:3000` | Target URL for load test suite              |
| `SENTRY_DSN`                                   | No       | _None_                  | Sentry Data Source Name for error reporting |
| `SENTRY_ENVIRONMENT`                           | No       | `development`           | Deployment environment tag for Sentry       |
| `SENTRY_TRACES_SAMPLE_RATE`                    | No       | `1.0`                   | Dynamic performance tracing sample rate     |

---

## Available Scripts

```bash
# Development & Build
bun run dev              # Start dev server with watch mode (Development)
bun run dev:test         # Start dev server with watch mode (Testing)
bun run build            # Compile TypeScript to dist/
bun run start            # Run production build
bun run start:test       # Run production build with Testing secrets
bun run start:debug      # Start with debug inspector

# Quality & Verification
bun run check            # Full verification gate (check-types + lint)
bun run check-types      # TypeScript typecheck (tsc --noEmit)
bun run lint             # ESLint static analysis with cache
bun run format           # Prettier code formatting

# Database, Migrations & Seeding
bun run db:generate      # Generate SQL migrations from Drizzle schemas
bun run db:migrate       # Apply pending migrations
bun run db:push          # Push schema directly to database (dev mode)
bun run db:seed          # Seed 3-tier idempotent development fixtures
bun run db:seed:reset    # Reset tables and re-seed fixtures (Blocked in production)
bun run db:seed:clean    # Truncate all tables without re-seeding (Blocked in production)
bun run db:studio        # Launch Drizzle Studio web GUI
bun run db:baseline      # Verify database baseline across environments

# Testing & Benchmarking
bun test                 # Run unit tests
bun run test:watch       # Run unit tests in watch mode
bun run test:cov         # Run unit tests with code coverage
bun run test:ci          # Run unit tests with coverage & JUnit report output
bun run test:e2e         # Run integration tests against PostgreSQL & Redis
bun run test:bench       # Run micro-benchmark performance runner
bun run test:load        # Run end-to-end k6 concurrency & stress testing suite
bun run test:load:build  # Compile k6 TypeScript test script to dist/
bun run test:load:seed   # Provision load test fixtures and offline JWT tokens
bun run test:load:run    # Execute k6 concurrency stress test scenarios
bun run test:load:verify # Assert post-test database invariants and teardown

# Code Generation
bun run i18n:generate    # Generate TypeScript definitions for translation keys
bun run openapi:generate # Generate TypeScript types from OpenAPI schema
bun run prepare          # Setup Husky Git hooks
```

---

## Architecture & Engineering Standards

- **Architectural Decision Records**: Stored in [`docs/adr/`](docs/adr/).
- **Domain Workflow Specs**: Stored in [`docs/design/`](docs/design/).
- **Engineering Standards**: 9-pillar operational standards in [`docs/standards/`](docs/standards/).

---

## License

Distributed under the MIT License. See `LICENSE` for details.
