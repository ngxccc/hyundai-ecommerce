# 12. Sentry Observability, Error Tracking, Breadcrumb Aggregation, and Performance Monitoring Architecture

Date: 2026-08-29  
Deciders: Team / Core Architecture

### Metadata

- **ID**: `ADR-0012`
- **Status**: `Accepted`
- **Date**: `2026-08-29`
- **Feature**: `infrastructure`
- **Topic**: `Sentry SDK Integration, Zero-Noise Error Filtering, Breadcrumb Aggregation, PII Sanitization, and Log-Trace Correlation`
- **Target Module**: `src/common/services/sentry.service.ts`, `src/common/filters/global-exception.filter.ts`, `src/common/interceptors/logging.interceptor.ts`, `src/modules/outbox/outbox.service.ts`, `src/database/database.module.ts`
- **Spec Reference**: Issue #71, `ADR-0005` (Pino Logging Library Selection), `ADR-0004` (Payment Confirmation Architecture), `docs/design/sentry-observability-workflow.md`

---

## Status

Accepted

---

## Context

In high-concurrency ticketing systems handling explosive bursts during seat reservations (`POST /bookings/reserve`), runtime exceptions, database timeouts, and background worker failures must be captured with detailed stack traces, diagnostic context, and user journey breadcrumbs without introducing alert fatigue, burning error quotas, or leaking sensitive PII.

Simulating mass contention on seats and background asynchronous operations introduces four core engineering challenges:

1. **Alert Fatigue & Quota Depletion under High-Concurrency Contention**:
   During flash sales and k6 load tests (500–2,000 VUs competing for a single seat), hundreds of requests legitimately receive `HTTP 409 Conflict` (enforced by Redlock or PostgreSQL GiST exclusion constraints). If an APM SDK blindly captures all exceptions, standard 4xx client errors consume the monthly quota (5,000 errors/month) within seconds and spam on-call engineers with false alarms.
2. **PII & Credential Leakage Risk (OWASP / GDPR / PCI-DSS)**:
   Unhandled server crashes and database query errors often contain sensitive client payloads (`password`, `refreshToken`, `accessToken`, `idempotencyKey`, `PAYOS_*` secret keys). These payloads must be strictly sanitized before transmission to third-party APM cloud ingestion endpoints.
3. **Non-HTTP Execution Blindspots (Outbox Relay Worker & BullMQ Queues)**:
   70% of fatal failures in e-commerce and ticketing backends occur outside the HTTP request lifecycle (e.g., mail dispatch failure, Outbox relay worker timeout, payment webhook retry exhaustion). An HTTP-only exception filter leaves background workers completely unmonitored.
4. **Disjointed Traceability (Client Error $\leftrightarrow$ Sentry Dashboard $\leftrightarrow$ Pino NDJSON Logs)**:
   When a client encounters an `HTTP 500 Internal Server Error`, support teams need an unambiguous, correlated identifier linking the client's RFC 9457 Problem Details payload directly to Sentry error events and Pino stdout logs.

---

## Decision

We decided to establish an Enterprise-Grade Sentry Observability & Error Tracking Architecture structured across 5 core pillars:

1. **Zero-Noise Error & Exception Filtering Matrix**:
   - **HTTP 5xx & Unhandled System Exceptions**: Captured immediately as Sentry Exception Alerts with full error stack, request URL, HTTP method, client IP, User-Agent, user identity (`userId`, `email`, `role`), and PostgreSQL driver error codes (e.g., `42P01`, `08006`).
   - **HTTP 4xx Client Errors (`400`, `401`, `403`, `404`, `409`, `422`, `429`)**: Strictly filtered out from Sentry Exception Alerts. Recorded exclusively as breadcrumbs (`category: 'http.client_error'`, level `warning`) to maintain historical context for subsequent crashes without consuming error quotas.
2. **PII Sanitization & Security Scrubbing**:
   - Implements `beforeSend` and `beforeBreadcrumb` hooks in `SentryService` via recursive `sanitizeSensitiveData` masking:
     - Headers: `authorization`, `cookie`, `set-cookie`.
     - Body Fields: `password`, `confirmPassword`, `token`, `refreshToken`, `accessToken`, `checksumKey`, `apiKey`, `clientSecret`.
   - Database query logging captures SQL statement structure and parameter counts (`paramCount: N`) while omitting raw parameter values containing client data.
3. **Closed-Loop Traceability Pipeline**:
   - For every `HTTP 500` server error, `GlobalExceptionFilter` retrieves the generated Sentry `eventId` and embeds it directly into the RFC 9457 JSON response payload.
   - Sentry scope tags every transaction and error with `requestId` and authenticated `userId`, enabling 1-click cross-correlation between client error responses, Sentry Cloud alerts, and Pino NDJSON logs.
4. **Background Worker & Dead-Letter Alerting**:
   - **Outbox Relay Worker (`OutboxService`)**: Captures Sentry exceptions **only** upon terminal retry exhaustion (`attempt >= MAX_RETRY_COUNT (3)`). Transient retries (attempts 1 and 2) log warnings and append breadcrumbs to avoid alert spam.
   - **BullMQ Processors (`MailProcessor`)**: Listens to terminal queue failures to capture unhandled dead-letter events with custom issue fingerprinting.
5. **Dynamic Traffic Sampling & Graceful Lifecycle**:
   - **Dynamic Sampling (`tracesSampler`)**: Drops 100% (`0.0`) of traces for health checks and API documentation routes (`/`, `/health`, `/metrics`, `/reference`, `/api-json`). Enforces `maxBreadcrumbs: 50`.
   - **Graceful Shutdown**: `SentryService` implements `onApplicationShutdown` and awaits `Sentry.flush(2000)` to ensure all in-flight buffers are dispatched before the container terminates.
   - **Release Signature Tracking**: Automatically binds `release: ${npm_package_name}@${npm_package_version}+${commitSha}` using environment variables (`RENDER_GIT_COMMIT` / `GITHUB_SHA`).

---

## Consequences

### Positive Consequences

- Guarantees instant root-cause identification for production crashes with full stack traces, breadcrumb timelines, and correlated Pino logs.
- Eliminates alert fatigue and preserves free-tier quotas during high-concurrency load testing (500–2,000 VUs).
- 100% compliance with OWASP PII data protection standards via automated payload scrubbing.
- Automatic suspect commit attribution and regression tracking across Render deployments.

### Negative Consequences

- Minor memory allocation overhead for maintaining rolling breadcrumb ring buffers (capped at 50 entries).
- Outgoing HTTPS network requests for Sentry event ingestion during 5xx server failures.

---

### Explicit Tradeoffs

- **Zero-Noise 4xx Suppression vs Immediate Error Visibility**: By dropping 4xx errors from Sentry alerts, we eliminate alert fatigue and preserve free-tier quotas at the expense of not having Sentry-level alerts for sudden spikes in 400 Bad Request client errors (which are instead monitored via Prometheus/Grafana or Pino logs).
- **PII Sanitization Overhead vs Zero Data Leakage**: Recursive object deep-scrubbing introduces minor CPU overhead on error serialization to guarantee zero leakage of user passwords, tokens, or payment credentials.
- **In-Flight Buffer Flush Ceiling vs Process Exit Latency**: Bounded 2-second timeout on `Sentry.flush()` guarantees containers shut down promptly during deployments without hanging the CI/CD pipeline while maximizing error event delivery.

---

## Decision Drivers

- **Zero-Noise Alerting**: Prevent quota burn and alert fatigue during high-concurrency flash sales and load testing.
- **Data Privacy & Compliance**: Ensure zero PII or credential leakage to third-party cloud APM providers.
- **Closed-Loop Traceability**: Enable seamless correlation between client errors, Sentry alerts, and Pino logs.
- **Operational Resilience**: Graceful degradation when Sentry is unconfigured and zero packet loss on process termination.

---

## Validation & Verification

- Verified Sentry SDK graceful no-op execution when `SENTRY_DSN` is empty across unit and E2E test suites.
- Unit tests in `sentry.service.spec.ts` assert PII scrubbing, scope tagging, and breadcrumb accumulation.
- Unit tests in `global-exception.filter.spec.ts` verify 5xx Sentry capture, 4xx filtering, and `eventId` injection into RFC 9457 responses.
- Documentation suites pass cleanly via `validate-docs.mjs`.
