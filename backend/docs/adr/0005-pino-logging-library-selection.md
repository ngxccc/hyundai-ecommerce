# 5. Pino Logging Library Selection & Architecture Comparison

Date: 2026-08-01  
Deciders: Team / Core Architecture

### Metadata

- **ID**: `ADR-0005`
- **Status**: `Accepted`
- **Date**: `2026-08-01`
- **Feature**: `infrastructure`
- **Topic**: `Pino Logging Library Selection & Architecture Comparison`
- **Target Module**: `src/app.module.ts`, `src/main.ts`, `src/common/interceptors/logging.interceptor.ts`
- **Spec Reference**: `docs/adr/0004-payment-confirmation-architecture.md` (System Invariant `INV-8`)

---

## Status

Accepted

---

## Context

In high-concurrency NestJS APIs, logging plays a key role in system observability, debugging, and maintaining Service Level Objectives (SLOs) under peak traffic.

### Architecture Motivation & Codebase State:

1. **Node.js Single-Thread Bottleneck**: Default `console.log` statements are synchronous I/O operations. Continuous stdout logging under high concurrency blocks the Event Loop, increasing p99 response latency.
2. **Structured Logging (`INV-8 Binding`)**: Per `ADR-0004` (`INV-8: Observability SLO Guard`), logs in high-risk operations (Booking, Payment, Webhooks) MUST use Structured JSON so aggregators (ELK, Grafana Loki, Datadog) can index fields automatically.
3. **Manual Serialization Debt**: Developers previously authored manual serialization statements like `Logger.log(JSON.stringify({ level: 30, ... }))`, increasing memory allocations and technical debt.
4. **Correlation & RFC 9457 Exception Tracking**: Automatically attaches `requestId` and `traceId` to log statements and RFC 9457 error responses without manual parameter passing.

---

## Considered Options

- **Option A (Chosen)**: Pino + nestjs-pino — _Chosen for high throughput (3x-5x faster than Winston), native structured JSON logging, and non-blocking process model_
- **Option B**: Winston + nestjs-winston — _Rejected due to in-thread JSON formatting overhead and high memory allocations under load_
- **Option C**: Default NestJS ConsoleLogger — _Rejected because plain string interpolation forces manual JSON.stringify workarounds_
- **Option D**: Morgan — _Rejected because it only supports HTTP request/response logging, not general application logs_
- **Option E**: Bunyan / Roarr / Log4js — _Rejected due to unmaintained status or lack of native NestJS integration_

---

## Decision

**Y-Statement Summary**: In the context of high-concurrency NestJS API observability, facing Node.js single-thread Event Loop blocking under high log volume, we decided for Pino logging with NDJSON stdout output to achieve high throughput and native structured JSON logging, accepting pino-pretty dev-dependency for local development.

We selected **Pino** (via `nestjs-pino` and `pino-pretty`) as the official logging solution.

### Codebase Architecture:

1. **Module Declaration (`src/app.module.ts`)**: Uses `LoggerModule.forRoot()` with `pinoHttp`. Enables `pino-pretty` in development and streams raw NDJSON to `stdout` in production.
2. **Global Logger Override (`src/main.ts`)**: Instantiates app with `bufferLogs: true` and overrides NestJS default Logger via `app.useLogger(app.get(Logger))`.
3. **HTTP Access Logging (`src/common/interceptors/logging.interceptor.ts`)**: Captures HTTP Request/Response details and execution duration.

---

## Evaluated Options & Comparison

### Option A: Pino + nestjs-pino (CHOSEN)

- **Characteristics**:
  - High performance: 3x–5x faster than Winston by minimizing stringification overhead on the main Event Loop.
  - Native `AsyncLocalStorage` integration propagates `requestId` automatically across async contexts.
  - Native Structured Logging: Accepts metadata objects directly (`this.logger.info({ bookingId }, "Payment confirmed")`) without manual stringification.
- **Pros**: Low RAM allocation, full NestJS compatibility, cloud-native NDJSON output.
- **Cons**: Requires `pino-pretty` dev-dependency for local human-readable logs.

### Option B: Winston + nestjs-winston (REJECTED)

- **Cons**: Slower than Pino (formats JSON on the main Event Loop), higher memory footprint under load.

### Option C: Default NestJS ConsoleLogger (REJECTED)

- **Cons**: Plain text output forces manual `JSON.stringify` calls.

### Option D: Morgan (REJECTED)

- **Cons**: Restricted to HTTP requests; cannot log service or worker events.

### Option E: Bunyan / Roarr / Log4js (REJECTED)

- **Cons**: Unmaintained or lacks NestJS adapters.

---

## Decision Comparison Matrix

| Evaluation Criteria                | Option A: Pino (CHOSEN)                     | Option B: Winston                | Option C: ConsoleLogger | Option D: Morgan        |
| :--------------------------------- | :------------------------------------------ | :------------------------------- | :---------------------- | :---------------------- |
| **Event Loop Overhead**            | ⚡ Minimal (Worker thread / fast stringify) | 🔴 High (Main thread formatting) | 🔴 High (Sync I/O)      | 🟡 Moderate             |
| **Structured JSON Logging**        | Native (Object -> NDJSON)                   | Supported                        | Manual `JSON.stringify` | Custom string format    |
| **Context & Trace ID Propagation** | Automatic (`AsyncLocalStorage`)             | Manual                           | Manual                  | Express middleware only |
| **NestJS Integration**             | Native (`nestjs-pino`)                      | Good (`nestjs-winston`)          | Built-in                | Express Middleware only |

---

## Consequences

### Positive Outcomes

1. **Minimized Latency Spikes**: Prevents Event Loop blocking during high-volume log writes.
2. **Invariant Adherence (`INV-8`)**: Enforces structured JSON format across transaction logs.
3. **Observability Correlation**: Tracks `traceId` across HTTP requests, error filters, and background jobs.

### Explicit Tradeoffs

- **Development Formatting Dependency**: Requires `pino-pretty` as a dev-dependency for human-readable local development logs.

## Status & Approval

- **Status**: Accepted & Implemented.
- **Target Location**: `docs/adr/0005-pino-logging-library-selection.md`
