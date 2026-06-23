# Order Service Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `DbOrderService` in `order.service.ts` to extract duplicate query selections, cart locking logic, and price calculations, reducing code size by ~40% and simplifying maintenance while preserving transaction safety.

**Architecture:** We will define a module-level `COMPLEX_ORDER_SELECT` constant for unified Drizzle selection queries and apply it to 5 read/query methods. We will also extract transactional cart locking and price calculations into private helper methods (`validateAndLockCart`, `recalculateOrderTotal`) within the `DbOrderService` class.

**Tech Stack:** Bun, TypeScript, Drizzle ORM, Zod, PostgreSQL

---

### Task 1: Verify Baseline Unit Tests Pass

**Files:**
- Test: `packages/database/src/services/order/order.service.test.ts`

- [ ] **Step 1: Run unit tests to verify a clean baseline**

Run: `bun test packages/database/src/services/order/order.service.test.ts`
Expected: 21 tests pass successfully.

---

### Task 2: Define and Apply `COMPLEX_ORDER_SELECT` Constant

**Files:**
- Modify: `packages/database/src/services/order/order.service.ts`
- Test: `packages/database/src/services/order/order.service.test.ts`

- [ ] **Step 1: Add `COMPLEX_ORDER_SELECT` to `order.service.ts`**

Add the following block right before `export class DbOrderService` (approx. line 60):

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
        parentId: true,
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

- [ ] **Step 2: Replace selection config in `listUserOrders`**

Replace:
```typescript
    return (await this.db.query.orders.findMany({
      where: { userId: { eq: userId } },
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
      orderBy: { createdAt: "desc" },
    })) as unknown as ComplexOrder[];
```
With:
```typescript
    return (await this.db.query.orders.findMany({
      where: { userId: { eq: userId } },
      ...COMPLEX_ORDER_SELECT,
      orderBy: { createdAt: "desc" },
    })) as unknown as ComplexOrder[];
```

- [ ] **Step 3: Replace selection config in `listUserOrdersPaginated`**

Replace the hydration step query (approx. line 191-227):
```typescript
    const hydratedRows = await this.db.query.orders.findMany({
      where: { id: { in: orderIds } },
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
    });
```
With:
```typescript
    const hydratedRows = await this.db.query.orders.findMany({
      where: { id: { in: orderIds } },
      ...COMPLEX_ORDER_SELECT,
    });
```

- [ ] **Step 4: Replace selection config in `listCompanyOrders`**

Replace the Drizzle query in `listCompanyOrders` (approx. line 272-309) with:
```typescript
    return (await this.db.query.orders.findMany({
      where: { userId: { in: userIds } },
      ...COMPLEX_ORDER_SELECT,
      orderBy: { createdAt: "desc" },
    })) as unknown as ComplexOrder[];
```

- [ ] **Step 5: Replace selection config in `listCompanyOrdersPaginated`**

Replace the hydration step query in `listCompanyOrdersPaginated` (approx. line 379-415) with:
```typescript
    const hydratedRows = await this.db.query.orders.findMany({
      where: { id: { in: orderIds } },
      ...COMPLEX_ORDER_SELECT,
    });
```

- [ ] **Step 6: Replace selection config in `getComplexOrder`**

Replace the Drizzle query in `getComplexOrder` (approx. line 625-681) with:
```typescript
  async getComplexOrder(orderId: string, userId?: string) {
    return await this.db.query.orders.findFirst({
      where: userId ? { id: orderId, userId } : { id: orderId },
      ...COMPLEX_ORDER_SELECT,
    });
  }
```

- [ ] **Step 7: Run unit tests to verify queries function correctly**

Run: `bun test packages/database/src/services/order/order.service.test.ts`
Expected: PASS

- [ ] **Step 8: Commit the selection config refactoring**

```bash
git add packages/database/src/services/order/order.service.ts
git commit -m "refactor: extract COMPLEX_ORDER_SELECT constant and apply to query methods"
```

---

### Task 3: Extract Cart Locking and Validation Helper (`validateAndLockCart`)

**Files:**
- Modify: `packages/database/src/services/order/order.service.ts`
- Test: `packages/database/src/services/order/order.service.test.ts`

- [ ] **Step 1: Add private `validateAndLockCart` helper to `DbOrderService`**

Add the helper method near the bottom of `DbOrderService` class (approx. line 1380):

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

- [ ] **Step 2: Replace cart locking in `createOrderWithItems`**

Replace:
```typescript
      if (cartIdToClear) {
        try {
          await tx
            .select({ id: carts.id })
            .from(carts)
            .where(eq(carts.id, cartIdToClear))
            .for("update", { noWait: true });
        } catch (err) {
          if (
            (isPostgresError(err) &&
              err.code === POSTGRES_ERROR_CODES.LOCK_NOT_AVAILABLE) ||
            (err instanceof Error &&
              err.message.includes("could not obtain lock"))
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
          .where(eq(cartItems.cartId, cartIdToClear));

        if (currentCartItems.length !== items.length) {
          throw new Error("errors.cartChanged");
        }
        for (const item of items) {
          const matching = currentCartItems.find(
            (c) =>
              c.productId === item.productId && c.quantity === item.quantity,
          );
          if (!matching) {
            throw new Error("errors.cartChanged");
          }
        }
      }
```
With:
```typescript
      if (cartIdToClear) {
        await this.validateAndLockCart(tx, cartIdToClear, items);
      }
```

- [ ] **Step 3: Replace cart locking in `checkoutWithTradeCredit`**

Replace:
```typescript
      if (cartId) {
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
            (err instanceof Error &&
              err.message.includes("could not obtain lock"))
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
            (c) =>
              c.productId === item.productId && c.quantity === item.quantity,
          );
          if (!matching) {
            throw new Error("errors.cartChanged");
          }
        }
      }
```
With:
```typescript
      if (cartId) {
        await this.validateAndLockCart(tx, cartId, items);
      }
```

- [ ] **Step 4: Run unit tests to verify cart validation behaves correctly**

Run: `bun test packages/database/src/services/order/order.service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit the cart validation refactoring**

```bash
git add packages/database/src/services/order/order.service.ts
git commit -m "refactor: extract validateAndLockCart helper method"
```

---

### Task 4: Extract Order Total Recalculation Helper (`recalculateOrderTotal`)

**Files:**
- Modify: `packages/database/src/services/order/order.service.ts`
- Test: `packages/database/src/services/order/order.service.test.ts`

- [ ] **Step 1: Add private `recalculateOrderTotal` helper to `DbOrderService`**

Add the helper method near the bottom of `DbOrderService` class (approx. line 1380):

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

- [ ] **Step 2: Replace total recalculation in `checkoutWithTradeCredit`**

Replace:
```typescript
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
      const recalculatedTotal =
        Math.round(subtotal * (1 + FINANCIAL_CONSTANTS.VAT_RATE) * 100) / 100;
```
With:
```typescript
      const recalculatedTotal = await this.recalculateOrderTotal(tx, items);
```

- [ ] **Step 3: Run unit tests to verify recalculation behaves correctly**

Run: `bun test packages/database/src/services/order/order.service.test.ts`
Expected: PASS

- [ ] **Step 4: Commit the recalculation refactoring**

```bash
git add packages/database/src/services/order/order.service.ts
git commit -m "refactor: extract recalculateOrderTotal helper method"
```

---

### Task 5: Final Code Verification & Quality Checks

- [ ] **Step 1: Run complete unit test suite**

Run: `bun test packages/database/src/services/order/order.service.test.ts`
Expected: 21 tests pass

- [ ] **Step 2: Run linter checks**

Run: `bun run lint`
Expected: PASS (No linting issues)

- [ ] **Step 3: Run strict TypeScript checks**

Run: `bun run check-types`
Expected: PASS (No type errors)
