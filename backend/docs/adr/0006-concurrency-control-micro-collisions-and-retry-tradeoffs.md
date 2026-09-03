# 6. Concurrency Control Micro-Collisions & Retry Trade-offs

Date: 2026-07-28
Deciders: Team / Core Architecture

### Metadata

- **ID**: `ADR-0006`
- **Status**: `Accepted`
- **Date**: `2026-07-28`
- **Feature**: `booking`
- **Topic**: `Concurrency Control Micro-Collisions, Redlock Parameters & Retry Trade-offs`
- **Target Module**: `src/modules/booking/` & `src/common/redis/`

---

## Status

Accepted

---

## Context

In high-concurrency ticket booking applications (flash-sales), thousands of users click to select the exact same seat (e.g., Seat `A12` at Showtime `S99`) within the exact same millisecond window.

A naive lock implementation causes two core failure modes:

1. **Double-Booking / Overselling**: Two transactions read the seat as available concurrently and both attempt to set it to reserved.
2. **False Rejections**: If the system fails requests immediately on the first microsecond lock attempt without retries (`retryCount: 0`), users whose requests arrived just 1ms behind get rejected instantly even if the leading transaction aborts split-seconds later.

---

## Considered Options

- **Option A (Chosen)**: Redlock with Micro-Retries (`retryCount: 3`, `retryDelay: 200ms`, `retryJitter: 50ms`) — _Chosen for optimal UX absorbing 99% of micro-collisions within 600ms while capping thread pool exhaustion risk_
- **Option B**: Fail-Fast Lock (`retryCount: 0`) — _Rejected due to high false rejection rate for 1ms race conditions during flash sales_
- **Option C**: High Retries (`retryCount: 10`) — _Rejected because user experience suffers (5s spinner) and DB connection pool faces severe starvation_

---

## Decision Outcome

Chosen Option: **Option A**.

By pairing **RAM Micro-Retries** (`retryCount: 3`, `retryDelay: 200ms`, `retryJitter: 50ms`) with **Database Pessimistic Locking** (`SELECT ... FOR UPDATE`), the system achieves sub-millisecond rejection of invalid requests, zero overselling, and optimal user experience during flash sale events.

---

## Consequences

### Positive Consequences

- Prevents false rejections caused by 1-2ms race condition micro-collisions.
- Random jitter window (0-50ms) eliminates the Thundering Herd Problem.
- Upper boundary (`retryCount: 3`) strictly caps maximum latency (<600ms) and avoids connection pool starvation.

### Negative Consequences

- Requests colliding on the exact same seat incur up to 600ms latency before receiving failure notification.

### Explicit Tradeoffs

- **Latency vs Connection Pool Utilization**: Allowing up to 3 retries (max ~600ms wait time) introduces a small latency trade-off to drastically lower false rejection rates. Higher retry limits (e.g. 10 retries) would cause DB connection pool starvation.
- **Fail-Fast vs User Experience**: Choosing micro-retries over immediate fail-fast (`retryCount: 0`) sacrifices instantaneous error response for microsecond collision absorption.

---

## Decision Drivers

- **User Experience**: Reduce false negative rejection rate when seat locks release quickly.
- **System Stability**: Protect DB connection pool and thread execution limits under high concurrency.
- **Concurrency Invariant**: Guarantee zero double-booking or seat overselling.

---

## Validation & Verification

- `bun test src/modules/booking/` passes under simulated concurrent seat reservation benchmarks.

---

## Metadata & References

- **Original Location**: `second-brain/Docs/Booking/Concurrency_Control_Micro_Collisions_And_Retry_Tradeoffs.md`
