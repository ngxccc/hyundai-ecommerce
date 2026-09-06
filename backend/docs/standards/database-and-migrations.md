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

## 3. Projection Strategy: Bare vs Explicit

Drizzle expands `.select()` and `.returning()` to explicit schema columns. Balance PostgreSQL heap fetch cost against type inference:

| Pattern                               | When to Use                                                                                                                                                            | Engine Mechanism                                                                                       |
| :------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Bare `.select()` / `.returning()`** | Single-row by PK (`id`, `orderCode`), `INSERT/UPDATE ... RETURNING`, lean tables (`orders`, `payments`, `outbox_events`).                                              | Tuple already in 8KB shared buffer; 0 extra disk I/O. Retains full `InferSelectModel` typing.          |
| **Explicit `.select({ ... })`**       | Multi-row listing (20–100 rows), tables with TOAST blobs (`products.descriptionVi`, `specSheet`), index-only existence checks, masking secrets (`users.passwordHash`). | Skips TOAST table lookups, prevents memory bloat, enables B-Tree index-only scans without heap access. |

```ts
// Bare: single-row lookup or mutation return
const [payment] = await db
  .select()
  .from(payments)
  .where(eq(payments.id, id))
  .limit(1);
const [newTx] = await db
  .insert(paymentTransactions)
  .values(payload)
  .returning();

// Masked: omit secrets
const { passwordHash, verificationToken, ...safeUserColumns } =
  getTableColumns(users);
const [user] = await db
  .select(safeUserColumns)
  .from(users)
  .where(eq(users.id, id));

// TOAST-trimmed: paginated listing
const { descriptionVi, descriptionEn, specSheet, ...summaryColumns } =
  getTableColumns(products);
const items = await db.select(summaryColumns).from(products).limit(20);

// Index-only: existence check
const [exists] = await db
  .select({ id: leads.id })
  .from(leads)
  .where(eq(leads.id, id))
  .limit(1);
```

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
