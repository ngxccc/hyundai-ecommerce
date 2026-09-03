# Concurrency & Locking Standards

## 1. Locking Tier Decision Matrix

| Concurrency Tier              | Mechanism               | When to Apply                                                 | Failure Mode                                       |
| :---------------------------- | :---------------------- | :------------------------------------------------------------ | :------------------------------------------------- |
| **Tier 1 (DB Constraint)**    | `EXCLUDE USING gist`    | Show scheduling, hall time slot allocation.                   | PostgreSQL error `23P01` (Exclusion Violation).    |
| **Tier 2 (Pessimistic Lock)** | `SELECT ... FOR UPDATE` | Seat reservation in single DB transaction.                    | Blocks transaction until lock acquired or timeout. |
| **Tier 3 (Distributed Lock)** | `Redlock` via Redis     | Cross-instance critical sections (e.g. payment confirmation). | Throws 409 Conflict if lock cannot be acquired.    |

---

## 2. Deadlock Prevention: Mandatory Lock Ordering

When locking multiple resources simultaneously (e.g., reserving 5 seats at once):

- **RULE**: You MUST sort resource IDs in **ascending lexicographical order** before acquiring locks.

```ts
// GOOD: Deadlock-proof lock ordering
const sortedSeatIds = [...seatIds].sort((a, b) => a.localeCompare(b));

// Acquire locks in sorted order
const lockedSeats = await tx
  .select()
  .from(showSeats)
  .where(inArray(showSeats.seatId, sortedSeatIds))
  .for("update");
```

---

## 3. Redlock Configuration & Safety Protocols

- **Key Naming Convention**: `lock:<domain>:<resourceId>` (e.g. `lock:show_seats:${showId}`).
- **TTL Calculation**:
  $$\text{TTL} = \text{Max Expected Execution Time} + \text{Clock Drift Buffer (e.g. 500ms)}$$
- **Release Guarantee**: Always release locks in a `finally` block or use scoped lock wrappers:

```ts
const lock = await redlockService.acquire([resourceKey], 5000);
try {
  // Execute critical business logic
} finally {
  await redlockService.release(lock);
}
```

---

## 4. Resilience: Fail-Open vs Fail-Closed Policies

- **Rate Limiter / Metrics**: **Fail-Open** — If Redis rate limiter is offline, allow the request to proceed rather than throwing a 500 error to legitimate users.
- **Seat Booking / Financial Debits**: **Fail-Closed** — If distributed lock or database transaction fails, reject the mutation with 409/500 to prevent double-spending or overselling.
