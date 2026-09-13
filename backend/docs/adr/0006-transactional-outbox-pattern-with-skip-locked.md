# 6. Transactional Outbox Pattern with Non-Blocking Concurrency (SKIP LOCKED) for Reliable Event Dispatch

Date: 2026-09-12

## Status

Accepted

## Context

In an enterprise B2B quotation and distribution system, operational events (e.g., customer RFQ submissions, admin price approvals, commercial document exports, sales dispatch notifications, and background email alerts) must trigger asynchronous tasks and external integrations reliably.

Prior to implementing the Transactional Outbox, asynchronous side-effects faced the classical distributed systems **Dual-Write Problem**:

1. **The Dual-Write Vulnerability**:
   - Persisting business data in PostgreSQL and then immediately dispatching an event to an external message broker (Redis/BullMQ) or third-party API (Resend, MailProcessor) introduces a critical failure window.
   - If the database transaction commits successfully but the network connection to the message broker fails, the event is permanently lost, leading to silent data desynchronization (e.g., quote status changed to `APPROVED` but sales staff and buyers receive no notification).
   - If the event is dispatched prior to committing the database transaction, any subsequent database rollback results in "phantom notifications" where external services act on data that was never committed.
2. **Distributed 2PC Overhead**:
   - Traditional Two-Phase Commit (2PC) or XA transactions impose severe throughput degradation, coordination latency, and single-point-of-failure vulnerabilities, making them inappropriate for modern decoupled web architectures.
3. **Naïve Polling Bottlenecks**:
   - A basic polling table without concurrency controls creates high database contention. Using standard `SELECT ... FOR UPDATE` causes workers to block each other when multiple backend replicas poll simultaneously, drastically limiting horizontal scaling.

---

## Decision

We implement the **Transactional Outbox Pattern** with PostgreSQL **`FOR UPDATE SKIP LOCKED`** row-level concurrency in `backend/src/modules/outbox/`:

### 1. Co-Located Atomic Persistence

- Every event publication is executed within the **exact same ACID database transaction** as the primary business entity mutation:
  ```typescript
  await db.transaction(async (tx) => {
    // 1. Mutate primary business entity
    await tx
      .update(quotes)
      .set({ status: "APPROVED" })
      .where(eq(quotes.id, id));

    // 2. Insert outbox event in the same transaction
    await tx.insert(outboxEvents).values({
      type: "quote.approved",
      payload: { quoteId: id, totalQuotedPrice },
      status: "PENDING",
    });
  });
  ```
- Both writes either commit atomically or roll back completely. This eliminates the dual-write window at the database engine level.

### 2. Non-Blocking Worker Concurrency via `SKIP LOCKED`

- The background polling worker sweeps the `outbox_events` table using PostgreSQL's native `FOR UPDATE SKIP LOCKED` capability:
  ```typescript
  const events = await tx
    .select()
    .from(outboxEvents)
    .where(eq(outboxEvents.status, "PENDING"))
    .orderBy(asc(outboxEvents.createdAt))
    .limit(10)
    .for("update", { skipLocked: true });
  ```
- **Concurrency Mechanic**: When Worker A locks rows 1 through 10, Worker B immediately skips those 10 locked rows without blocking, locking rows 11 through 20 instead.
- This allows horizontal scaling across multiple backend instances with **zero lock contention** and **zero idle waiting**.

### 3. At-Least-Once Delivery & Failure Recovery

- Each acquired event is transitioned to `PROCESSING` within the worker context.
- Upon successful dispatch to consumers or message queues, the event is marked `COMPLETED`.
- If an unhandled exception or network timeout occurs, the event transitions to `FAILED` with incremented retry counts and exponential backoff.
- Downstream event consumers are architected to be idempotent, safely tolerating at-least-once delivery guarantees.

### 4. Automated Garbage Collection

- A scheduled cron processor (`OutboxCleanupProcessor`) periodically prunes `COMPLETED` events older than a configurable retention threshold (e.g., 7 days) to maintain optimal table size and index performance:
  ```typescript
  await db
    .delete(outboxEvents)
    .where(
      and(
        eq(outboxEvents.status, "COMPLETED"),
        lt(outboxEvents.updatedAt, retentionCutoff),
      ),
    );
  ```

---

## Consequences & Trade-offs

### Positive

- **Guaranteed Message Delivery**: Zero event loss even during full network partitions or external broker outages.
- **True Horizontal Scalability**: Replicas scale linearly without deadlocks or row-level lock contention thanks to `SKIP LOCKED`.
- **Zero Monolithic 2PC Overhead**: Relies entirely on native, single-node PostgreSQL transactions.
- **Auditability**: The `outbox_events` table acts as an append-only historical audit trail of all domain events emitted by the platform.

### Negative & Mitigations

- **Eventual Consistency Latency**: Events are not dispatched instantaneously; they incur polling interval latency (typically 100ms - 500ms).
  - _Mitigation_: The polling interval is tuned for low-latency dispatch, with critical notification pipelines prioritized.
- **Idempotency Requirement on Consumers**: At-least-once delivery mandates that consumers implement idempotency keys or deduplication logic to prevent double processing during retry cycles.
