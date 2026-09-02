# Concurrency & Locking Standards

## 1. Locking Tier Decision Matrix

| Concurrency Tier              | Mechanism               | When to Apply                                                 | Failure Mode                                       |
| :---------------------------- | :---------------------- | :------------------------------------------------------------ | :------------------------------------------------- |
| **Tier 1 (DB Constraint)**    | `EXCLUDE USING gist`    | Time-range promotion overlaps, flash sale validity windows.  | PostgreSQL error `23P01` (Exclusion Violation).    |
| **Tier 2 (Pessimistic Lock)** | `SELECT ... FOR UPDATE` | Warehouse inventory stock reservation during checkout.        | Blocks transaction until lock acquired or timeout. |
| **Tier 3 (Distributed Lock)** | `Redlock` via Redis     | PayOS webhook confirmation, concurrent checkout on hot SKUs. | Throws 409 Conflict if lock cannot be acquired.    |

---

## 2. Deadlock Prevention: Mandatory Lock Ordering

When locking multiple inventory records simultaneously (e.g. checking out 5 products across warehouses):

- **RULE**: You MUST sort resource IDs in **ascending lexicographical order** before acquiring locks.

```ts
// GOOD: Deadlock-proof lock ordering
const sortedStockIds = [...stockIds].sort((a, b) => a.localeCompare(b));

// Acquire locks in sorted order
const lockedStock = await tx
  .select()
  .from(warehouseStocks)
  .where(inArray(warehouseStocks.id, sortedStockIds))
  .for("update");
```

---

## 3. Redlock Configuration & Safety Protocols

- **Key Naming Convention**: `lock:<domain>:<resourceId>` (e.g. `lock:inventory:${productId}`, `lock:checkout:${orderId}`).
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
- **Order Checkout / Stock Allocation / Financial Debits**: **Fail-Closed** — If distributed lock or database transaction fails, reject the mutation with 409/500 to prevent double-spending or overselling.
