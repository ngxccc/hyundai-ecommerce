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
