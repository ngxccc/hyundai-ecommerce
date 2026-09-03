# 4. Payment Confirmation & Ticket Issuance Architecture

Date: 2026-07-31  
Deciders: Team / Core Architecture

### Metadata

- **ID**: `ADR-0004`
- **Status**: `Accepted`
- **Date**: `2026-07-31`
- **Feature**: `booking`
- **Topic**: `Payment Confirmation & Ticket Issuance Architecture`
- **Target Module**: `src/modules/booking/` & `src/modules/outbox/`
- **Spec Reference**: `docs/design/booking-payment-confirmation-workflow.md`

---

## Status

Accepted

---

## Context

When users complete payment for a booking reservation (`POST /bookings/confirm`), the system receives transaction metadata (`paymentMethod`, `transactionId`, `amount`), transitions booking status from `pending_payment` to `confirmed`, updates seat status from `reserved` to `booked`, and issues tickets alongside confirmation emails.

In high-concurrency environments with gateway webhook retries and duplicate network packets, the system must guarantee:

1. **Anti-Double-Processing**: Prevents duplicate payments or confirming expired bookings (`expired`).
2. **Zero Event Loss**: Guarantees ticket issuance event publishing even during BullMQ queue or network interruptions.
3. **100% ACID Atomicity**: Synchronizes mutations across `payments`, `bookings`, `show_seats`, and `outbox_events`.

---

## Considered Options

- **Option A (Chosen)**: PostgreSQL Transaction + Pessimistic Locking (`SELECT ... FOR UPDATE`) + 60s Redis Idempotency Key + Transactional Dual-Write Outbox — _Chosen for 100% ACID atomicity and zero event loss_
- **Option B**: Application-level Redlock only — _Rejected because Redis master failovers can drop locks and non-transactional DB writes cause event loss on crash_

---

## Decision

**Y-Statement Summary**: In the context of booking payment confirmation, facing double-processing and webhook retries, we decided for DB Transaction Pessimistic Locking with Transactional Outbox Pattern to achieve 100% ACID atomicity and zero event loss, accepting short DB row locks.

We adopted **Option A (PostgreSQL Transaction + Pessimistic Locking + Transactional Outbox Pattern)**.

### Key Rationale

1. **ACID Integrity (`INV-1`)**: Payment confirmation and ticket issuance constitute high-risk operations. Executing all writes within a single DB transaction bound by `SELECT ... FOR UPDATE` guarantees absolute consistency.
2. **Transactional Outbox (`INV-2`)**: Solves the Dual-Write Problem by refraining from calling external services (email, third-party webhooks) inside the DB transaction. The `booking.confirmed` event is persisted into `outbox_events` and relayed asynchronously by `OutboxService`.
3. **Double-Processing Defense (`INV-3`)**: Provides two-layer protection via a 60s Redis Idempotency key and the database unique index `payments_transaction_id_uidx`.

---

## Evaluated Architectural Options

### Option A: PostgreSQL Transaction + Pessimistic Locking (`SELECT ... FOR UPDATE`) + 60s Redis Idempotency Key + Transactional Dual-Write Outbox (CHOSEN)

- **Description**:
  - Confirm requests check the 60s Redis key `idempotency:confirm:<userId>:<key>`. Hits return cached responses immediately.
  - Opens a single PostgreSQL DB transaction.
  - Locks the target `bookings` row via `SELECT ... FOR UPDATE`, verifying status (`pending_payment`) and expiration (`NOW() <= expiresAt`).
  - Executes atomic mutations:
    1. INSERT payment record with status `completed` and unique `transactionId` (`payments_transaction_id_uidx`).
    2. UPDATE `bookings` status to `confirmed`.
    3. UPDATE `show_seats` status to `booked` and clear `lockedUntil`.
    4. INSERT `outbox_events` record with type `booking.confirmed` containing ticket and email metadata.
  - Commits DB Transaction. Removes BullMQ delayed cancellation job post-commit and caches response in Redis.
- **Pros**:
  - Absolute ACID Atomicity: All tables update or roll back atomically.
  - Zero Event Loss guarantee via Transactional Outbox Pattern.
  - Eliminates race conditions with BullMQ delayed jobs via `SELECT ... FOR UPDATE`.
- **Cons**:
  - Holds DB row locks for several milliseconds (mitigated by indexed queries within a single transaction).

### Option B: Application-level Redlock Only (REJECTED)

- **Description**: Uses Redlock on Redis `lock:booking:<id>` to synchronize application processes, followed by decoupled DB updates.
- **Pros**: Reduces row locks in PostgreSQL.
- **Cons**: Redis connectivity failures or failovers can drop locks, causing race conditions. Decoupled DB writes risk losing email events if app crashes mid-process.

---

## Consequences

### Positive Outcomes

1. Guarantees 100% ACID atomicity across `payments`, `bookings`, `show_seats`, and `outbox_events`.
2. Achieves Zero Event Loss via the Transactional Outbox Pattern.

### Explicit Tradeoffs

- Holds short DB row locks (few milliseconds) within DB transactions to prevent race conditions.

---

## System Invariants Binding

Implementation MUST adhere to system invariants specified in `docs/design/booking-payment-confirmation-workflow.md`:

- `INV-1`: Atomicity & Anti-Double-Processing via DB Pessimistic Locking (`SELECT ... FOR UPDATE`).
- `INV-2`: Transactional Dual-Write Outbox (Zero Event Loss).
- `INV-3`: Expiry, Locking & Idempotency Safety.
- `INV-4`: Reconciliation & Auto-Refund Safety (`PaymentReconciliationProcessor`).
- `INV-5`: Strict Ownership & Anti-Enumeration Defense (404 on Unauthorized Access).
- `INV-6`: PayOS HMAC-SHA256 Signature Verification & Anti-Replay Defense.
- `INV-7`: Redis Fail-Closed Fallback (Graceful Degradation to DB Transaction).
- `INV-8`: DB Statement Timeout (3s) & Observability SLO Guard (Structured JSON Logging).
- `INV-9`: UI/UX State Machine & Status Polling (3s) Contract.

---

## Status & Approval

- **Status**: Accepted & Implemented.
- **Target Location**: `docs/adr/0004-payment-confirmation-architecture.md`
