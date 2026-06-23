# Order Service Code Deduplication and Simplification Design

## Status
Accepted

## Context
The `DbOrderService` implementation at `packages/database/src/services/order/order.service.ts` is currently ~1390 lines long. It handles multiple database queries and transaction-heavy business flows such as checkout, logistics bidding, status transitions, and analytics.

During code review, several highly repetitive blocks and optimization targets were identified:
1. **Repeated Query Selection Configurations:** The detailed select and relation-join configuration (`columns` and `with` structures) is duplicated across 5 distinct listing and query methods.
2. **Duplicate Cart Locking & Verification Logic:** The logic to lock the cart (`FOR UPDATE NOWAIT`) and verify that the items in the cart match the order payload is duplicated in `createOrderWithItems` and `checkoutWithTradeCredit`.
3. **Duplicate Order Total Price Recalculation:** The VAT-inclusive price calculation and catalog validation logic is duplicated in B2B trade credit checkouts.

Instead of decomposing the service into 5 different files via a Facade Pattern (which would increase directory pollution and merely move complexity around), we will perform a **targeted code deduplication and refactoring** directly in `order.service.ts`. This simplifies the code, reduces file size by ~40%, and preserves transaction safety and backwards compatibility.

---

## Decision

We will extract the repetitive configurations and business logics into shared module-level constants and private helper methods within the `DbOrderService` class.

### 1. Extract `COMPLEX_ORDER_SELECT`
We will define a unified select configuration at the module level in `packages/database/src/services/order/order.service.ts`:

```typescript
const COMPLEX_ORDER_SELECT = {
  columns: {
    id: true,
    status: true,
    paymentStatus: true,
    paymentMethod: true,
    shippingFee: true,
    shippingAddress: true,
    totalAmount: true,
    createdAt: true,
    userId: true,
    approvalStatus: true,
  },
  with: {
    user: {
      columns: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        taxId: true,
        phone: true,
        businessType: true,
      },
    },
    items: {
      columns: {
        id: true,
        productName: true,
        productSku: true,
        quantity: true,
        unitPrice: true,
      },
    },
  },
} as const;
```

We will apply this constant to:
* `listOrders`
* `listUserOrders`
* `listUserOrdersPaginated` (hydration step)
* `listCompanyOrders`
* `listCompanyOrdersPaginated` (hydration step)
* `getComplexOrder`

### 2. Extract Cart Locking and Validation (`validateAndLockCart`)
We will create a private helper method inside `DbOrderService` to handle locking and validating the cart items:

```typescript
private async validateAndLockCart(
  tx: IDatabase,
  cartId: string,
  items: CreateOrderItemDTO[],
): Promise<void> {
  try {
    await tx
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.id, cartId))
      .for("update", { noWait: true });
  } catch (err) {
    if (
      (isPostgresError(err) &&
        err.code === POSTGRES_ERROR_CODES.LOCK_NOT_AVAILABLE) ||
      (err instanceof Error && err.message.includes("could not obtain lock"))
    ) {
      throw new Error("errors.lockAcquisitionFailed", { cause: err });
    }
    throw err;
  }

  const currentCartItems = await tx
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));

  if (currentCartItems.length !== items.length) {
    throw new Error("errors.cartChanged");
  }
  for (const item of items) {
    const matching = currentCartItems.find(
      (c) => c.productId === item.productId && c.quantity === item.quantity,
    );
    if (!matching) {
      throw new Error("errors.cartChanged");
    }
  }
}
```

We will call this method from:
* `createOrderWithItems`
* `checkoutWithTradeCredit`

### 3. Extract Order Total Recalculation (`recalculateOrderTotal`)
We will create a private helper method inside `DbOrderService` to query product prices from the catalog, compute the subtotal, and add the VAT rate:

```typescript
private async recalculateOrderTotal(
  tx: IDatabase,
  items: CreateOrderItemDTO[],
): Promise<number> {
  let subtotal = 0;
  for (const item of items) {
    const [product] = await tx
      .select({ price: products.price })
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);
    if (!product) {
      throw new Error("errors.productNotFound");
    }
    subtotal += parseFloat(product.price) * item.quantity;
  }
  return Math.round(subtotal * (1 + FINANCIAL_CONSTANTS.VAT_RATE) * 100) / 100;
}
```

We will call this method in:
* `checkoutWithTradeCredit`

---

## Consequences

1. **Safety & Stability:** Zero changes to public interfaces and method signatures. No callers in `apps/storefront` or `apps/admin` will need adjustments.
2. **Transaction Integrity:** Passing the database client (`tx`) explicitly to the helper methods ensures that all locks, selects, and price lookups execute correctly within the boundaries of the transaction.
3. **Reduced Cognitive Load:** The file size of `order.service.ts` will shrink significantly, making it much easier to read and maintain for developers.
4. **Consistency:** Using a single query selection constant `COMPLEX_ORDER_SELECT` ensures that all methods returning a `ComplexOrder` hydrate exactly the same fields.

---

## Verification & Test Plan

1. **Unit Tests:** Run existing unit tests:
   ```bash
   bun test packages/database/src/services/order/order.service.test.ts
   ```
2. **Integration Tests:** Run existing integration tests to ensure checkout transactions and concurrency locks are not broken:
   ```bash
   bun test packages/database/src/services/order/order.service.integration.test.ts
   ```
