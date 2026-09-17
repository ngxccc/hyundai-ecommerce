# Code Architecture & Design Principles

## 1. Deep Modules & Information Hiding

- **Thick Implementation, Narrow Interface**: Expose minimal, intention-revealing method signatures that conceal internal complexity (distributed locks, transactions, ORM queries, multi-tier caching, outbox events).
- **Complexity Sink**: Internalize error recovery, defaults, and boundary normalization inside the service rather than leaking them to controllers or callers.
- **Define Errors Out of Existence**: Structure domain APIs so edge conditions resolve naturally and idempotently (e.g. cancelling an already cancelled quote returns current state rather than throwing).
- **Prohibit Shallow Pass-Throughs**: Every service method MUST enforce domain invariants, data transformations, or transaction boundaries. Direct ORM pass-throughs with zero domain logic are banned.

```ts
// GOOD: Deep Module (Encapsulates stock reservation, transaction boundary, and outbox event)
@Injectable()
export class OrderCheckoutService {
  async checkout(dto: CreateOrderDto): Promise<OrderResult> {
    return this.db.transaction(async (tx) => {
      // 1. Validate stock & lock inventory rows
      // 2. Insert order & order items
      // 3. Emit outbox event for payment integration
    });
  }
}

// BANNED: Shallow Pass-Through (Zero domain logic, pure ORM forwarding indirection)
@Injectable()
export class ShallowCategoryService {
  constructor(private readonly db: DrizzleDB) {}
  async getCategory(id: string) {
    return this.db.query.categories.findFirst({ where: eq(categories.id, id) });
  }
}
```

---

## 2. AHA (Avoid Hasty Abstractions) & Rule of Three

- **Prefer Concrete Duplication Over Wrong Abstraction**: Write logic inline until exact repetition across 3 distinct domain contexts reveals the stable, unified invariant.
- **The Rule of Three Progression**:
  1. _First occurrence_: Inline concrete implementation.
  2. _Second occurrence_: Duplicate with localized adjustments.
  3. _Third occurrence_: Extract shared abstraction only when invariants, failure modes, and lifecycles are identical.
- **Dissolve Tangled Abstractions**: If a shared helper requires caller-type branching (`if (caller === 'admin')`), immediately inline the logic back into respective callers.

---

## 3. Business Knowledge SSOT vs. Orthogonal Separation

- **Domain Knowledge SSOT**: Maintain a single authoritative implementation for every business calculation (e.g. pricing, discounts, VAT rates, commission splits, inventory states).
- **Orthogonal Lifecycle Separation**: Keep domain models separate when their business lifecycles diverge, even if schemas currently look identical (e.g. `AdminCreateProductDto` vs `B2bQuoteLineItemDto`). Unify only when a business change in one strictly mandates the exact same change in the other.

---

## 4. Command-Query Separation (CQS) & Idempotency

- **Commands (Mutations)**: State-changing operations execute within atomic transactions and return minimal acknowledgments (`{ id, status }`). Heavy nested joins or analytics MUST NOT run inside mutation transactions.
- **Queries (Reads)**: Query operations MUST be side-effect-free, safe to retry, and leverage selective projections for Index-Only Scans.
- **Idempotent Mutations**: State-mutating endpoints (payments, order creation, cancellations, quote finalizations) MUST enforce deterministic idempotency via unique constraints, distributed locks, or idempotency keys.

---

## 5. Law of Demeter (Least Knowledge)

- **Immediate Collaborators Only**: Methods interact strictly with injected dependencies, method arguments, and internally instantiated entities.
- **Direct Aggregate Computation**: Prohibit chained traversals across aggregate boundaries (`order.getCustomer().getTier().getDiscount()`). Encapsulate calculations within the immediate aggregate method (`order.calculateDiscount()`).

---

## 6. YAGNI & Evolutionary Design

- **Zero Speculative Code**: Implement strictly what active tickets, specs, and domain invariants demand.
- **Banned Speculations**: Unused configuration toggles, premature database columns, dead helper methods, and generic abstractions with a single consumer.
- **Refactor at Thresholds**: Keep modules tight and tested so future extensions remain cheap, rather than pre-engineering speculative flexibility.
