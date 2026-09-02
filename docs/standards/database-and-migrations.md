# Database & Migration Standards

## 1. Drizzle ORM Schema Conventions

- **Database Column Naming**: MUST be `snake_case` in PostgreSQL (`snakeCase.table(...)`).
- **TypeScript Model Properties**: MUST be `camelCase` in TypeScript.
- **Primary Keys**:
  - Entity primary keys: UUIDv7 generated via `primaryKeyUuid` (`uuid().defaultRandom().primaryKey()`).
  - Associative / Join tables: Composite primary keys (`primaryKey({ columns: [table.orderId, table.productId] })`).
- **Timestamps**:
  - Every base entity MUST include `created_at` and `updated_at` timestamps with timezone (`timestamp({ withTimezone: true, mode: "date" }).defaultNow()`).

---

## 2. Indexing Strategy & Performance Rules

- **Index Naming**:
  - Non-unique index: `<table>_<columns>_idx` (e.g. `products_category_id_price_idx`, `orders_user_id_status_idx`).
  - Unique index: `<table>_<columns>_uidx` (e.g. `users_email_uidx`, `products_slug_uidx`).
- **Partial Index Rule**: Use `WHERE` clauses for sparse states (e.g. indexing `verification_expires_at` ONLY where `status = 'pending_verification'`).
- **PostgreSQL Exclusion Constraints**: Use `EXCLUDE USING gist` for time-range collision protection.

---

## 3. Query Optimization: YAGNI Selective Projections & Selective Returning

- **PROHIBITION**: Never execute `SELECT *` (`.select()`) or unbounded `.returning()` across any layer of the application (API services, seeders, background jobs, or CLI tools).
- **MANDATORY**:
  1. **Explicit Selective Projections**: Explicitly project only required columns using Drizzle `.select({ col1: table.col1, ... })` to maximize PostgreSQL Index-Only Scans and prevent unneeded serialization of heavy or sensitive columns (e.g. `passwordHash`, `verificationToken`).
  2. **Explicit Selective Returning**: When mutating records with `.returning()`, always specify the exact return payload shape (e.g. `.returning({ id: table.id, name: table.name })`). Never emit bare `.returning()`.

```ts
// GOOD (Selective Projection, leverages Index-Only Scan)
const [product] = await db
  .select({ id: products.id, price: products.price, slug: products.slug })
  .from(products)
  .where(eq(products.id, productId))
  .limit(1);

// GOOD (Selective Returning on Mutation)
const [newProduct] = await db
  .insert(products)
  .values(productData)
  .returning({ id: products.id, slug: products.slug });

// BANNED (Fetches unneeded columns, bypasses index-only scan optimization)
const [product] = await db.select().from(products).where(eq(products.id, productId));

// BANNED (Returns entire raw row including timestamps and internal metadata)
const [newProduct] = await db.insert(products).values(productData).returning();
```

---

## 4. Transaction Boundaries & Concurrency Safety

- **Atomic Consistency**: Combine all interdependent mutations (e.g. Order + Outbox Event + Warehouse Stock Allocation) in a single `db.transaction(async (tx) => { ... })`.
- **Short-Lived Transactions**: Never perform external HTTP requests, heavy hashing, or Redis operations inside an active database transaction.
- **Rollback Safety**: Any uncaught exception inside `db.transaction()` automatically triggers an atomic `ROLLBACK`.

---

## 5. Zero-Downtime Migration Policy (Expand & Contract)

1. **Step 1 (Expand)**: Add new nullable columns or tables in migration Phase 1. Deploy code that writes to both old and new columns.
2. **Step 2 (Backfill)**: Run background migration to populate existing records.
3. **Step 3 (Contract)**: Deploy code that reads only from new columns. Drop old columns in Phase 2 migration.

- **NEVER** drop or rename a column in a single deploy step.
