# 1. Distributed Lock Mechanism for Show Seat Reservation

Date: 2026-07-04  
Deciders: Team / Core Architecture

### Metadata

- **ID**: `ADR-0001`
- **Status**: `Accepted`
- **Date**: `2026-07-04`
- **Feature**: `booking`
- **Topic**: `Distributed Lock Mechanism for Show Seat Reservation`
- **Target Module**: `src/modules/booking/` & `src/common/redis/`
- **Spec Reference**: `docs/design/booking-core-concurrency-workflow.md`

---

## Status

Accepted

---

## Context

In high-concurrency ticket booking systems, multiple users frequently attempt to select and reserve identical seats for the same showtime (`show_id`) simultaneously.

Without concurrency control mechanisms:

1. **Race Conditions & Double-Booking**: Concurrent requests occurring within the same millisecond can read seat status as `available` simultaneously and grant reservations to separate user accounts.
2. **Database Overload**: Relying exclusively on direct database locks during high-traffic ticket releases saturates DB connection pools and causes lock-wait timeouts, overwhelming PostgreSQL.

The system requires a double-locking mechanism that combines high-speed RAM layer rejection with 100% ACID database atomicity.

---

## Considered Options

- **Option A (Chosen)**: Redis Redlock (RAM) + PostgreSQL Pessimistic Lock (`SELECT ... FOR UPDATE`) — _Chosen for fast RAM rejection (<5ms) and 100% ACID persistence safety_
- **Option B**: PostgreSQL Pessimistic Locking Only — _Rejected because it overloads DB connection pool during high traffic spikes_
- **Option C**: Application Optimistic Locking (Version Column) — _Rejected because high micro-collisions cause excessive application retries_

---

## Decision

**Y-Statement Summary**: In the context of high-concurrency seat reservation, facing race conditions and DB overload, we decided for Double-Locking (Redis Redlock + PostgreSQL Pessimistic Lock) to achieve 100% data integrity and sub-5ms fast rejection, accepting Redis cluster maintenance and unmaintained package wrapper risk.

We adopted the **Double-Locking Mechanism**:

1. **Layer 1 - RAM Memory (Redis Level)**: Redis Distributed Lock using the Redlock algorithm (`mike-marcacci/node-redlock` v5) with a 2000ms TTL for fast rejection (<5ms) of duplicate requests.
2. **Layer 2 - Persistent Storage (PostgreSQL Level)**: PostgreSQL row lock `SELECT ... FOR UPDATE` inside a single DB transaction to guarantee absolute data consistency.

Uses the `redlock` (v5) package wrapped inside `RedlockService` with a local type definition bridge at `src/types/redlock.d.ts`.

---

## Evaluated Architectural Options & Comparison

### Option A: Redis Redlock (RAM) + PostgreSQL Pessimistic Lock (`SELECT ... FOR UPDATE`) (CHOSEN)

- **Characteristics**:
  - Incoming requests check and acquire Redis lock `lock:show_seat:<seatId>` first.
  - On success, opens a PostgreSQL DB transaction and locks seat rows using `SELECT ... FOR UPDATE` on `show_seats`.
  - Updates seat status to `reserved`, sets `lockedUntil`, and commits transaction.
- **Pros**:
  - High performance: Intercepts 95%+ duplicate requests in Redis without touching PostgreSQL.
  - Fail-safe safety: Even during Redis connectivity loss or failovers, PostgreSQL Pessimistic Locks at Layer 2 guarantee zero double-booking.
- **Cons**:
  - Requires maintaining Redis infrastructure configurations.

### Option B: PostgreSQL Locking Only (REJECTED)

- **Characteristics**: Omits Redis; all reservation requests execute DB `SELECT ... FOR UPDATE` directly against PostgreSQL.
- **Cons**: Overloads DB connection pools during traffic spikes, causing DB statement timeouts and latency spikes.

### Option C: Optimistic Locking Only (Version Column) (REJECTED)

- **Characteristics**: Updates seat status via `UPDATE show_seats SET status = 'reserved', version = version + 1 WHERE id = :id AND version = :version`.
- **Cons**: Under high seat contention (micro-collisions), application retry failure rates spike, wasting CPU resources and harming UX.

---

## Decision Comparison Matrix

| Evaluation Criteria                 | Option A: Redlock + DB Pessimistic (CHOSEN) | Option B: PostgreSQL Locking Only      | Option C: Optimistic Locking Only    |
| :---------------------------------- | :------------------------------------------ | :------------------------------------- | :----------------------------------- |
| **Rejection Speed (<5ms)**          | ⚡⚡⚡ Fast (Blocked at Redis)              | ⚡ Slow (Waits for DB Connection Lock) | ⚡ Moderate                          |
| **Anti Double-Booking (100% ACID)** | 🔒 Absolute (Two-Layer Defense)             | 🔒 Absolute                            | ⚠️ High retry overhead under traffic |
| **Database Load**                   | 🟢 Minimal (Only acquired locks reach DB)   | 🔴 High (All requests hit DB)          | 🟡 Moderate                          |
| **Code Complexity**                 | 🟡 Moderate (`RedlockService` wrapper)      | 🟢 Simple                              | 🟢 Simple                            |

---

## Consequences

### Positive Outcomes

1. **Superior Reservation Throughput**: Filters most seat contention in RAM under 5ms.
2. **Database Integrity Protection**: Eliminates over 90% of redundant locking queries to PostgreSQL.
3. **Fail-Safe Reliability**: PostgreSQL serves as the final persistent guard.

### Explicit Tradeoffs

- **Wrapper Dependency Maintenance**: Uses `mike-marcacci/node-redlock` v5 wrapped in `RedlockService`.
- **Exit Strategy**: A type bridge at `src/types/redlock.d.ts` isolates the codebase. If runtime changes break `redlock`, `RedlockService` can be replaced with native Redis Lua scripts via `ioredis`.

---

## System Invariants Binding

- `INV-1`: Atomicity & Anti-Double-Booking Guard (Redlock RAM Filter + DB Pessimistic Lock).
- `INV-7`: Redis Fail-Closed Degradation to DB Transaction.

---

## Status & Approval

- **Status**: Accepted & Implemented.
- **Target Location**: `docs/adr/0001-redlock-distributed-lock-concurrency-control.md`
