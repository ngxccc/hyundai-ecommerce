# Code Architecture & Design Principles

## 1. DRY vs. Orthogonal Code

- **Business Knowledge SSOT**: Maintain a single authoritative implementation for each calculation, domain invariant (`INV-N`), permission rule, and schema constraint.
- **Orthogonal Domain Separation**: Keep domain implementations separate when their business lifecycles diverge, even if their data structures currently match (e.g. `AdminUserUpdateDto` vs `PublicUserProfileDto`). Unify only when a change in one domain strictly demands the same change in the other.

---

## 2. YAGNI: Active Requirements Only

- **Zero Speculative Code**: Implement solely what active tickets and specifications require.
- **Banned Speculations**: Unused configuration flags, anticipatory database columns, uncalled helper methods, and generic type parameters with a single consumer.
- **Evolutionary Design**: Keep code simple and tested so future extensions remain cheap, rather than pre-engineering complexity into current implementations.

---

## 3. AHA (Avoid Hasty Abstractions) & Rule of Three

- **Prefer Duplication over Wrong Abstraction**: Write concrete logic inline until repetition reveals the exact shared pattern.
- **Rule of Three**:
  1. _First occurrence_: Implement concrete logic inline.
  2. _Second occurrence_: Duplicate with local adjustments.
  3. _Third occurrence_: Extract a shared abstraction only when three distinct, proven use-cases exhibit identical invariants.
- **Tangled Abstraction Rejection**: If a shared abstraction requires caller-specific branching (`isSpecialCase`, `callerType`), dissolve the abstraction and inline the logic.

---

## 4. Deep Modules & Information Hiding

- **Deep Interface**: Design modules with narrow, simple interfaces that conceal complex implementation mechanics (concurrency, distributed locks, database transactions, caching).
- **Prohibition of Pass-Through Layers**: Do NOT create shallow services or repositories that merely forward 1:1 calls to Drizzle ORM without transforming data or enforcing domain rules.
- **Pull Complexity Downward**: Internalize error recovery, default values, and cleanup within the service boundary instead of burdening callers.
- **Define Errors Out of Existence**: Design APIs to make boundary conditions natural and idempotent (e.g. deleting a non-existent entity returns `deleted: 0` / success rather than throwing `NotFoundException`).

```ts
// GOOD: Deep Module (Simple interface encapsulates inventory allocation, transaction boundaries, and outbox emission)
export class DbOrderService implements OrderService {
  constructor(protected readonly db: IDatabase) {}

  async createOrder(dto: CreateOrderDTO): Promise<TOrder> {
    // Encapsulates db.transaction, line items, stock reservation, and outbox event
  }
}

// BANNED: Shallow Pass-Through (Adds indirection without domain logic or data transformation)
export class ShallowCategoryService {
  constructor(private readonly db: IDatabase) {}
  async getCategory(id: string) {
    return this.db.query.categories.findFirst({ where: eq(categories.id, id) });
  }
}
```

---

## 5. Command-Query Separation (CQS) & Idempotency

- **Commands (Mutations)**: State-changing operations execute within atomic transactions and return minimal acknowledgments (`id`, `status`). Never execute heavy, nested query aggregations inside mutation handlers.
- **Queries (Reads)**: Query operations MUST be side-effect-free, safe to retry, and leverage selective projections for Index-Only Scans.
- **Idempotent Mutations**: State-mutating commands (payments, reservations, cancellations) MUST enforce deterministic idempotency via unique constraints or idempotency keys.

---

## 6. Law of Demeter (Least Knowledge)

- **Immediate Collaborators Only**: Methods MUST interact only with injected dependencies, method arguments, and created objects.
- **No Chained Traversals**: Prohibit deep object-graph navigation (`order.getUser().getTier().getDiscount()`). Encapsulate domain calculations within the immediate aggregate (`order.calculateDiscount()`).
