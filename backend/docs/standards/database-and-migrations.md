# Database & Migration Standards

## 1. Drizzle ORM Schema Conventions

- **Database Column Naming**: MUST be `snake_case` in PostgreSQL (`snakeCase.table(...)`).
- **TypeScript Model Properties**: MUST be `camelCase` in TypeScript.
- **Primary Keys**:
  - Entity primary keys: UUIDv7 generated via `primaryKeyUuid` (`uuid().defaultRandom().primaryKey()`).
  - Associative / Join tables: Composite primary keys (`primaryKey({ columns: [table.orderId, table.productId] })`).
- **Timestamps**:
  - Base entities extending `fullEntity` define `createdAt` and `updatedAt` with `.$onUpdate(() => new Date())`.
  - Never manually pass `updatedAt: new Date()` in update statements; Drizzle executes the hook automatically on query generation.

---

## 2. Indexing Strategy & Performance Rules

- **Index Naming**:
  - Non-unique index: `<table>_<columns>_idx` (e.g. `orders_user_id_created_at_idx`).
  - Unique index: `<table>_<columns>_uidx` (e.g. `users_email_uidx`).
- **Partial Index Rule**: Use `WHERE` clauses for sparse states (e.g. indexing `verification_expires_at` only where `status = 'PENDING_VERIFICATION'`).

---

## 3. Query Optimization: Projection Strategy

In Drizzle ORM, `.select().from(table)` and `.returning()` expand to the schema's explicit column list (not SQL `*`). Tailor projection depth to data sensitivity and query intent:

### A. Existence & State Guards (Index-Only Scans)

When checking record existence, ownership, or status transitions, project minimal columns to enable PostgreSQL Index-Only Scans without reading the heap:

```ts
// Fast: index-only scan on primary key
const [lead] = await db
  .select({ id: leads.id })
  .from(leads)
  .where(eq(leads.id, id))
  .limit(1);
```

### B. Sensitive & Heavy Column Masking

When querying tables containing secrets (`users`) or large text/JSON blobs (`products`), omit unneeded columns:

```ts
// Omit sensitive credentials from user queries
const {
  passwordHash,
  verificationToken,
  resetPasswordToken,
  ...safeUserColumns
} = getTableColumns(users);
const [user] = await db
  .select(safeUserColumns)
  .from(users)
  .where(eq(users.id, id));

// Omit heavy descriptions on product listing to reduce serialization I/O
const { descriptionVi, descriptionEn, specSheet, ...summaryColumns } =
  getTableColumns(products);
const items = await db.select(summaryColumns).from(products).limit(20);
```

### C. Full Entity Operations

For standard scalar tables without secrets or heavy blobs (`leads`, `categories`, `brands`), bare `.select().from(table)` and `.returning()` are idiomatic and maintainable. Avoid handcoding 15+ column projection objects when every field is consumed.

---

## 4. Transaction Boundaries & Concurrency Safety

- **Atomic Consistency**: Combine all interdependent mutations (e.g. Order + Outbox Event + Seat Lock) in a single `db.transaction(async (tx) => { ... })`.
- **Short-Lived Transactions**: Never perform external HTTP requests, heavy hashing, or Redis operations inside an active database transaction.
- **Rollback Safety**: Any uncaught exception inside `db.transaction()` automatically triggers an atomic `ROLLBACK`.

---

## 5. Zero-Downtime Migration Policy (Expand & Contract)

1. **Step 1 (Expand)**: Add new nullable columns or tables in migration Phase 1. Deploy code that writes to both old and new columns.
2. **Step 2 (Backfill)**: Run background migration to populate existing records.
3. **Step 3 (Contract)**: Deploy code that reads only from new columns. Drop old columns in Phase 2 migration.

- **NEVER** drop or rename a column in a single deploy step.
