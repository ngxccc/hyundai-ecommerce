# Database & Drizzle ORM Context

This document defines the standards and query conventions for database operations, migrations, and Drizzle ORM queries in this repository. All AI agents and developers must strictly follow these rules.

---

## 1. Drizzle Relational Query Builder: `where` Clause Syntax

Drizzle ORM's Relational Query Builder (`db.query.tableName.findFirst` or `findMany`) has strict expectations for the `where` option.

### Rule: Never Pass Raw SQL Expressions Directly to `where`

- **FORBIDDEN:** Do not pass an SQL expression directly as the `where` object:

  ```typescript
  // ❌ BAD: Will crash at runtime
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  ```

  - **Why:** The Drizzle Relational Query Builder expects either a callback function or a shorthand filter object. If you pass an SQL expression object directly, Drizzle attempts to iterate over its internal properties (such as `"decoder"` or `"sql"`), resulting in the error: `DrizzleError: Unknown relational filter field: "decoder"`.

### Allowed Syntax A: Callback Function (For complex/standard queries)

Use a callback function when you need complex conditions, SQL expressions, range queries, or standard operators:

```typescript
//  GOOD: Valid standard syntax
const product = await db.query.products.findFirst({
  where: (products, { eq }) => eq(products.id, productId),
});
```

### Allowed Syntax B: Shorthand Filter Object (For simple equality queries)

Use a plain object mapping column keys to values for simple equality filters:

```typescript
//  GOOD: Valid shorthand syntax
const product = await db.query.products.findFirst({
  where: {
    id: productId,
  },
});
```

---

## 2. Database Indexing Guidelines

Do not blindly index every column in a `WHERE`, `JOIN`, or `ORDER BY` clause. Consider selectivity, cardinality, and write overhead.

### Foreign Keys

- Always index foreign keys (e.g., `userId` in `orders`, `orderId` in `orderItems`, `productId` in `warehouseStocks`) as PostgreSQL does not index them automatically and they are heavily used in joins.

### Cardinality Rules

- **High Cardinality (UUID, Email, Phone, Slug, CreatedAt):** Index these columns if they are frequently queried, sorted, or range-scanned.
- **Low Cardinality (Boolean, Status, Role, Gender):** Avoid standard indexes as they lead to Full Table Scans since selectivity is low.

### Partial & Composite Indexes

- **Partial Indexes:** Use partial indexes (e.g., `where status = 'pending'`) for rare, hot states instead of indexing the entire column. Example for dashboard analytics (excluding cancelled orders):

  ```typescript
  index("order_active_metrics_idx")
    .on(table.createdAt)
    .where(sql`${table.status} != 'cancelled'`);
  ```

- **Composite Indexes:** Use composite indexes (e.g., `(userId, status)` or `(userId, status, createdAt)`) when queries filter by multiple fields or sort the results.
  - **Left-Prefix rule:** If a composite index `(col1, col2)` exists, do not create a separate index on `col1` as PostgreSQL can use the prefix.
  - **Sorting Directions:** For multi-column sorting with different directions (e.g., `status ASC, created_at DESC`), explicitly define the directions in the index to avoid in-memory sorting:

    ```typescript
    index("idx_name").on(table.status.asc(), table.createdAt.desc());
    ```

---

## 3. DTO Design, Query Selection & Returning Rules

All service layers and database operations must respect encapsulation, performance, and YAGNI (You Aren't Gonna Need It) principles.

### Rule A: Always Define DTOs Using `Omit`

Do not expose raw database schemas (which may contain sensitive columns like `password`) to the presentation/action layers. Define explicit DTO types using `Omit` to exclude audit fields (`createdAt`, `updatedAt`, `deletedAt`) and sensitive columns.

```typescript
//  GOOD: Clean and maintainable DTO using Omit
export type UserB2BProfileDTO = Omit<
  TUser,
  | "password"
  | "emailVerified"
  | "image"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;
```

### Rule B: Never Use Wildcard Selects (`SELECT *`) in DB Services

Service queries must explicitly select only the columns defined in their corresponding DTOs (using Drizzle's `.select({ ... })` or `columns: { ... }` in query builders). This reduces memory and connection overhead.

```typescript
//  GOOD: Selects only necessary fields
const [repayment] = await this.db
  .select({
    id: debtRepayments.id,
    userId: debtRepayments.userId,
    amount: debtRepayments.amount,
    paymentMethod: debtRepayments.paymentMethod,
    status: debtRepayments.status,
    orderCode: debtRepayments.orderCode,
    referenceCode: debtRepayments.referenceCode,
    paidAt: debtRepayments.paidAt,
  })
  .from(debtRepayments)
  .where(eq(debtRepayments.referenceCode, referenceCode))
  .limit(1);
```

### Rule C: Use Const Objects as Single Source of Truth for Column Selection

**This rule has been promoted to a first-class enforceable skill.**

See: `ag-strict-config-derivation` skill and its reference [single-source-of-truth-pattern.md](/.claude/skills/ag-strict-config-derivation/references/single-source-of-truth-pattern.md).

All new column selection logic **MUST** follow the strict const + mapped type derivation pattern defined in that skill.

### Rule C: Apply YAGNI to `.returning()` Clauses

When performing write operations (`INSERT`, `UPDATE`), do not blindly return the entire row using `.returning()`. Only return the minimum required columns (e.g., just `id` or only fields that the caller actively consumes).

```typescript
//  GOOD: Returns only the newly generated ID
const [result] = await tx.insert(userAddresses).values(data).returning({
  id: userAddresses.id,
});
```

## 4. Drizzle Query Style: Relational vs Core API

Drizzle provides two primary styles of querying data: **Relational Queries (`db.query`)** and **Core SQL Queries (`db.select`)**.

### Relational Queries (`db.query.tableName.findFirst / findMany`)

- **When to Use:** Use when querying deeply nested relationships (e.g. fetching an order with its items, associated shipping bids, and payment status details). It handles object nest hydration automatically, avoiding messy manual grouping of SQL JOIN results.
- **Overhead:** Has higher CPU runtime overhead because Drizzle must dynamically parse the query options and compile the SQL at runtime.

### Core SQL Queries (`db.select().from(tableName)`)

- **When to Use:** Use for flat, high-performance, single-table queries, simple JOINS, or critical hot paths (e.g. checking user session, fetching product lists).
- **Overhead:** Extremely low. Translates 1:1 to SQL statements.
- **Prepared Statements:** Highly recommended to combine with `.prepare()` for repetitive high-frequency lookup queries to compile the SQL query only once at startup.

---

## 5. TypeScript Type Utilities: Union vs Object Manipulation

Using the correct TypeScript utility type is critical to prevent compiler errors and preserve exact types.

### `Omit<T, K>` and `Pick<T, K>` (For Object/Interface Types)

- **Use case:** Manipulating keys of an object structure (like interface `TUser`).
- **Forbidden:** Do not use `Omit` or `Pick` on Union Types of string literals. Using `Omit` on a union (e.g. `"PAYOS" | "CASH"`) is a compiler anti-pattern because TypeScript treats it as omitting properties from the global `String` prototype object.

### `Exclude<T, U>` and `Extract<T, U>` (For Union/Literal Types)

- **Use case:** Manipulating elements inside a Union type (e.g. string literals like `"PAYOS" | "CASH" | "TRADE_CREDIT"`).
- **Example:**

  ```typescript
  type PaymentMethod = "PAYOS" | "CASH" | "TRADE_CREDIT";

  //  GOOD: CORRECT union type filtering
  type PublicPaymentMethod = Exclude<PaymentMethod, "TRADE_CREDIT">; // Resolves to "PAYOS" | "CASH"
  ```

---

## 6. Performance Optimization: Query Consolidation via Conditional Aggregation

Avoid executing multiple sequential queries to aggregate metrics from the same table (e.g. total count, sum, counts for specific date ranges, etc.).

### Rule: Use Conditional Aggregation to Collapse Multiple Aggregate Queries

Instead of making several roundtrips, use SQL `CASE WHEN` inside Drizzle `sql` expressions to gather multiple metrics in a single table scan. Combine independent queries using `Promise.all` for parallel execution.

#### ❌ Bad: Multiple sequential queries on the same table

```typescript
const totalOrders = await db.select({ count: sql`count(*)` }).from(orders);
const activeRevenue = await db
  .select({ sum: sql`sum(amount)` })
  .from(orders)
  .where(ne(orders.status, "CANCELLED"));
const current30DaysRevenue = await db
  .select({ sum: sql`sum(amount)` })
  .from(orders)
  .where(
    and(ne(orders.status, "CANCELLED"), gte(orders.createdAt, thirtyDaysAgo)),
  );
```

#### ✅ Good: Single query with conditional aggregates

```typescript
const [metrics] = await db
  .select({
    totalOrders: sql<number>`count(*)::integer`,
    totalRevenue: sql<string>`coalesce(sum(case when ${orders.status} != 'CANCELLED' then ${orders.totalAmount} else 0 end), '0')`,
    currentRevenue: sql<string>`coalesce(sum(case when ${orders.status} != 'CANCELLED' and ${orders.createdAt} >= ${thirtyDaysAgo} then ${orders.totalAmount} else 0 end), '0')`,
    currentOrders: sql<number>`count(case when ${orders.status} != 'CANCELLED' and ${orders.createdAt} >= ${thirtyDaysAgo} then 1 else null end)::integer`,
  })
  .from(orders);
```
