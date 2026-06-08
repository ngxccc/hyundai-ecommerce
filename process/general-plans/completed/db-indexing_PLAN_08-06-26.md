# Database Indexing - Plan

**Date**: 08-06-26  
**Complexity**: Simple  
**Status**: ✅ COMPLETED

## Overview

Establish database indexes in `hyundai-ecommerce` database schemas to optimize performance for frequently joined foreign keys, high-cardinality search columns, and sort keys. The repository context router at `process/context/all-context.md` and database context guidelines at `process/context/database/all-database.md` define the query syntax and indexing conventions. The execution will be performed incrementally, verified using tests configured under `process/context/tests/all-tests.md`, and committed using the `ag-git-commit` skill.

## Goals and Success Metrics

**Goals:**

- Add index definitions for high-cardinality and foreign key fields on relevant tables (`orderItems`, `shippingBids`, `warehouseStocks`, `users`, `quotes`, `quoteItems`, `quoteMessages`, `products`).
- Generate corresponding Drizzle migrations for the newly added indexes.
- Apply and baseline database schemas in the development environment.
- Perform incremental, logical git commits following Conventional Commits, with no code modifications during the commit stage and no pushes to the remote repo.

**Success Metrics:**

- All index configurations compile in TypeScript.
- Migrations generate cleanly via Drizzle Kit without schema conflicts.
- `bun run test` passes 100% locally.
- Git repository has clean, granular, logical commits representing the changes, with no remote push executed.

---

## Execution Brief

This is a database enhancement plan executed continuously. Stage and commit changes incrementally using the `ag-git-commit` skill rules to maintain a clean git history.

### Phase 1: Schema Updates

Add database indexes (`index()`) to `packages/database/src/schemas/` files. Focus on foreign keys and sorting columns identified in the research:

- `order_items`: indexes on `orderId` and `productId`.
- `shipping_bids` (if applicable): index on `orderId`.
- `warehouse_stocks`: index on `productId`.
- `users`: index on `dealerTierId` and `createdAt`.
- `quotes`: indexes on `userId` and `orderId`, and `createdAt`.
- `quote_items`: indexes on `quoteId` and `productId`.
- `quote_messages`: indexes on `quoteId` and `senderId`.
- `products`: index on `createdAt` (totalSalesCache index is already present).

### Phase 2: Schema Consolidation

Consolidate child `-item` schema files into their parent files to reduce file fragmentation and improve code navigation:

- Merge `orderItems` definition and its types from `order-item.schema.ts` into `order.schema.ts`.
- Merge `cartItems` definition and its types from `cart-item.schema.ts` into `cart.schema.ts`.
- Delete the standalone `order-item.schema.ts` and `cart-item.schema.ts` files.
- Update schema imports in `relations.ts` and exports in `index.ts`.

### Phase 3: Migration Generation

Run the Drizzle Kit migrations generator:

```bash
bun run db:generate
```

This generates the incremental SQL migration file mapping both our new indexes and the schema location consolidation (if recognized by Drizzle - table locations do not change in DB, only file locations).

### Phase 4: DB Migration & Sync

Apply the migration to the database using:

```bash
bun run db:migrate
```

Verify the migration script successfully registers the schema changes.

### Phase 5: Test & Verify

Run tests in `packages/database`:

```bash
bun run test
```

Confirm all 60 tests pass.

### Phase 6: Incremental Commits via `ag-git-commit`

## Stage and commit changes in logical batches using the `ag-git-commit` skill. **Do not change any code during this phase, and do not run `git push`.**

## Scope

**In-Scope:**

- Modifying database schemas under `packages/database/src/schemas/` to declare index fields.
- Consolidating `order-item` and `cart-item` schema files into `order` and `cart` schema files.
- Updating database import paths in `relations.ts` and `index.ts` to reflect consolidated files.
- Generating and applying incremental migration files.
- Local validation tests.
- Creating incremental git commits locally.

**Out-of-Scope:**

- Adding indexes on low-cardinality columns (e.g. `isQuoteOnly`, `status`, `role`, `totalStockCache`).
- Modifying business logic code in services or apps.
- Pushing code changes to the remote repository.

---

## Assumptions and Constraints

- Neon Postgres/PostgreSQL database instances support concurrent index creation.
- The baseline configuration (`baseline.ts`) handles migrations dynamically.
- Absolutely no `git push` is allowed during the execution.
- The `ag-git-commit` skill guidelines must be strictly followed.

---

## Acceptance Criteria

1. ✅ Schema index definitions compile without TypeScript errors.
2. ✅ Incremental migration is generated successfully inside `packages/database/drizzle/`.
3. ✅ Database migration succeeds and state synchronizes on Neon PostgreSQL.
4. ✅ All 60 unit and integration tests pass.
5. ✅ Git repository is committed in logical batches with conventional messages.
6. ✅ Worktree is clean and no push has been executed to the remote.

---

## Implementation Checklist

### 1. Update Schema Definitions (Add Indexes)

- [x] Modify `packages/database/src/schemas/order.schema.ts` to add `orderId` and `productId` indexes (after consolidation).
- [x] Modify `packages/database/src/schemas/warehouse-stock.schema.ts` to add `productId` index.
- [x] Modify `packages/database/src/schemas/user.schema.ts` to add `dealerTierId` and `createdAt` indexes.
- [x] Modify `packages/database/src/schemas/quotes.schema.ts` to add `userId`, `orderId`, and `createdAt` indexes for quotes; `quoteId` and `productId` indexes for quoteItems; and `quoteId` and `senderId` indexes for quoteMessages.
- [x] Modify `packages/database/src/schemas/product.schema.ts` to add `createdAt` index (avoid totalStockCache).

### 2. Consolidate Schema Files

- [x] Move `orderItems` table definition and TypeScript types (`TOrderItem`, `TNewOrderItem`) from `order-item.schema.ts` to `order.schema.ts`.
- [x] Move `cartItems` table definition and TypeScript types (`TCartItem`, `TNewCartItem`) from `cart-item.schema.ts` to `cart.schema.ts`.
- [x] Update `packages/database/src/schemas/relations.ts` imports to point to `order.schema` and `cart.schema` respectively.
- [x] Remove references to `order-item.schema` and `cart-item.schema` in `packages/database/src/schemas/index.ts`.
- [x] Delete `packages/database/src/schemas/order-item.schema.ts` and `packages/database/src/schemas/cart-item.schema.ts`.

### 3. Generate and Apply Migrations

- [x] Run `bun run db:generate` in `packages/database` directory to output SQL migration.
- [x] Run `bun run db:migrate` to push the indexes to Neon PostgreSQL dev branch.
- [x] Validate table state using Neon console or drizzle-kit studio if needed.

### 4. Run Test Verification

- [x] Run `bun run test` in `packages/database` and verify 60 tests pass.
- [x] Check for any database-side errors or timeouts.

### 5. Git Commits via `ag-git-commit`

- [x] Stage and commit Schema updates & consolidations:
  - Stage schema files under `packages/database/src/schemas/` (including deletions)
  - Commit with message: `feat(database): add indexes and consolidate order-item and cart-item schemas`
- [x] Stage and commit Migration files:
  - Stage generated migration folder under `packages/database/drizzle/`
  - Commit with message: `feat(database): generate migration for new schema indexes`
- [x] Verify `git status` shows clean worktree.
- [x] **DO NOT PUSH.**

---

## Phase Completion Rules

- **Phase 1 & 2 (Schema Design & Consolidation):** Complete when all TypeScript compiler check passes and schema files compile without errors.
- **Phase 3 & 4 (Migration and Synchronization):** Complete when migration files are generated and applied successfully in development environment, with DB schemas up-to-date.
- **Phase 5 (Verification):** Complete when `bun run test` runs and passes 100% of the co-located test suites.
- **Phase 6 (Git Commits):** Complete when the git log registers all logical commits locally and working tree is verified clean.

---

## Touchpoints

The following files will be touched during implementation:

- `packages/database/src/schemas/order-item.schema.ts` (deleted)
- `packages/database/src/schemas/cart-item.schema.ts` (deleted)
- `packages/database/src/schemas/order.schema.ts` (modified: table orderItems merged, indexes added)
- `packages/database/src/schemas/cart.schema.ts` (modified: table cartItems merged)
- `packages/database/src/schemas/relations.ts` (modified: imports updated)
- `packages/database/src/schemas/index.ts` (modified: exports updated)
- `packages/database/src/schemas/warehouse-stock.schema.ts` (modified: index added)
- `packages/database/src/schemas/user.schema.ts` (modified: indexes added)
- `packages/database/src/schemas/quotes.schema.ts` (modified: indexes added)
- `packages/database/src/schemas/product.schema.ts` (modified: index added)

---

## Public Contracts

- No public API contracts or type schemas are broken.
- The exported types (`TOrderItem`, `TNewOrderItem`, `TCartItem`, `TNewCartItem`) and tables (`orderItems`, `cartItems`) will remain fully available and exported via the package entrypoint `packages/database/src/schemas/index.ts`.

---

## Blast Radius

- **Low Risk:** All changes are localized to database schemas and migration files.
- **Zero Downtime:** Index creation is done on the development Neon PostgreSQL database.
- **No circular dependencies:** Care must be taken when moving imports/types between schemas to avoid circular dependencies.

---

## Verification Evidence

- Successful run of `bun run test` in `packages/database` (60 passed, 0 failed).
- Clear output of `git status` showing zero untracked or modified files after commits.
- Validated DB migration status in Neon PostgreSQL.

---

## Resume and Execution Handoff

- To resume the execution, the orchestrator should run `bun run test` to verify the baseline, then proceed with updating the schema files in Phase 1 and 2.
- Once verification passes, follow `ag-git-commit` to commit the staging areas in groups.
- Next step: **ENTER EXECUTE MODE**.

---

## Risks and Mitigations

- **Locking Tables during Index Creation:** Adding indexes on large live tables can lock writes.
  - _Mitigation:_ We are working on a development environment. For production, index creation should use `CREATE INDEX CONCURRENTLY` (which Drizzle handles or requires separate raw execution blocks).
- **Migration Conflicts:** Another branch adds migrations.
  - _Mitigation:_ The date-stamped and baselined structures prevent duplicate timestamps. Merges will require migrating/consolidating again if needed.
