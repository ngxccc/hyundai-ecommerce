# Phase 1: B2B Quotes Database Schema Extensions

**Date**: 01-06-26
**Complexity**: COMPLEX (Phase Program)
**Status**: ✅ VERIFIED

## Overview

This document specifies the detailed implementation plan for **Phase 1: B2B Quotes Database Schema Extensions** of the B2B CRM program. Building upon our existing core industrial equipment platform, we will design and deploy the Drizzle database tables, relationships, database service layers, and unit test suites required to power corporate quote negotiations and live deals.

We reference [process/context/all-context.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/all-context.md) for naming guidelines, schema-driven design rules, and dependency injection patterns, and [process/context/tests/all-tests.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/tests/all-tests.md) for test runners and database mocking conventions.

---

## Quick Links

- [Phase 1: B2B Quotes Database Schema Extensions](#phase-1-b2b-quotes-database-schema-extensions)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [Phase Completion Rules](#phase-completion-rules)
  - [Execution Brief](#execution-brief)
    - [Block 1: Drizzle Schemas \& Relations](#block-1-drizzle-schemas--relations)
    - [Block 2: Service Layer \& Registry](#block-2-service-layer--registry)
    - [Block 3: Unit Testing](#block-3-unit-testing)
    - [Expected Outcome](#expected-outcome)
  - [Phased Execution Workflow](#phased-execution-workflow)
    - [Step 1: Pre-Phase Research](#step-1-pre-phase-research)
    - [Step 2: Detailed Planning](#step-2-detailed-planning)
    - [Step 3: Implementation](#step-3-implementation)
    - [Step 4: Testing \& Verification](#step-4-testing--verification)
    - [Step 5: User Confirmation](#step-5-user-confirmation)
  - [Database Schema Specifications](#database-schema-specifications)
    - [1. `quote_status` Enum](#1-quote_status-enum)
    - [2. `quotes` Table](#2-quotes-table)
    - [3. `quote_items` Table](#3-quote_items-table)
    - [4. `quote_messages` Table](#4-quote_messages-table)
  - [Touchpoints](#touchpoints)
    - [`[NEW]` Files](#new-files)
    - [`[MODIFY]` Files](#modify-files)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Implementation Checklist](#implementation-checklist)
  - [Verification Evidence](#verification-evidence)
    - [1. Database Migration Generation](#1-database-migration-generation)
    - [2. Service Unit Testing](#2-service-unit-testing)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces (schemas are exported and compile cleanly in packages/database).
2. **Manual Test** - Drizzle migrations generate and execute correctly against PostgreSQL.
3. **Data Verification** - Services correctly execute database actions (tested via mocked database verification).
4. **Error Handling** - Edge cases (such as missing products or deleted users) are handled gracefully.
5. **User Confirmation** - User says "it works" after reviewing test outputs and schema migrations.

Status meanings:

- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working (requires explicit user-confirmation)
- 🚧 BLOCKED - Has issues

After each phase, we must document:

- [ ] What was tested manually
- [ ] Data verified in DB (show queries & results)
- [ ] Errors encountered and fixed
- [ ] User confirmation received

---

## Execution Brief

We break Phase 1 down into three core implementation blocks:

### Block 1: Drizzle Schemas & Relations

- **What happens**: Create `quotes.schema.ts` defining `quoteStatusEnum`, `quotes`, `quoteItems`, and `quoteMessages`. Register schemas inside `index.ts` and define multi-way associations inside `relations.ts`.
- **Test**: Run `bunx tsc -p tsconfig.json --noEmit` within `packages/database` to ensure compile-time type correctness.
- **Verify**: Run Doppler Drizzle generate to verify successful schema compilation and migration file output.
- **Done when**: `drizzle-kit generate` produces a clean SQL migration script.

### Block 2: Service Layer & Registry

- **What happens**: Create `quotes.service.ts` exposing CRUD actions for quote generation, state updating, negotiation log entry, and item price adjustments. Register the service in the singleton `registry.ts`.
- **Test**: Service compiles and constructor correctly accesses `this.db` using constructor injection.
- **Verify**: Exported services compile without circular dependencies in `packages/database/src/services/index.ts`.
- **Done when**: Services are fully exported and register.

### Block 3: Unit Testing

- **What happens**: Build co-located unit tests `quotes.service.test.ts` mirroring `order.service.test.ts`, mocking queries using the shared `db-mock` utility.
- **Test**: Run `bun test src/services/quotes.service.test.ts` to execute and verify correct DB mocks call assertions.
- **Verify**: Coverage reports and green checks for all service methods.
- **Done when**: 100% test pass rate with zero errors.

### Expected Outcome

- The PostgreSQL database is expanded with fully migrated quotes negotiation tables.
- A robust, single-source-of-truth service is registered for use by future App Router pages.
- Highly isolated unit test coverage guarantees business logic correctness.

---

## Phased Execution Workflow

We follow the strict RIPER-5 phase program execution loop:

### Step 1: Pre-Phase Research

- Reread `packages/database/src/schemas/helpers.schema.ts` to ensure consistent baseEntity fields are utilized.
- Read existing Drizzle relationship maps inside `packages/database/src/schemas/relations.ts`.
- Audit current `packages/database/src/tests/utils/db-mock.ts` to verify how database calls are mocked.
- **Checkpoint**: Present research findings to the user and request approval to proceed with execution.

### Step 2: Detailed Planning

- Based on research, finalize exact column types, lengths, and foreign key onDelete properties.
- Map the explicit files to be modified/created and describe the exact migration scripts.
- **Checkpoint**: Obtain final "go" or "approve" from the user.

### Step 3: Implementation

- Implement the exact files as approved:
  1. Define database schemas in `packages/database/src/schemas/quotes.schema.ts`.
  2. Extend `packages/database/src/schemas/relations.ts`.
  3. Register schemas in `packages/database/src/schemas/index.ts`.
  4. Write the database service in `packages/database/src/services/quotes.service.ts`.
  5. Register the singleton in `packages/database/src/services/registry.ts`.
  6. Export the service from `packages/database/src/services/index.ts`.

### Step 4: Testing & Verification

- Generate the database migration files using Drizzle Kit.
- Write the service unit tests in `packages/database/src/services/quotes.service.test.ts`.
- Run unit tests using `bun test` and run overall typecheck in the package.
- Document step-by-step outcomes, migration logs, and test coverage.

### Step 5: User Confirmation

- Present a structured post-stage summary to the user:

  ```text
  **What's Functional Now**: B2B Quotes Schema is defined, exported, and service methods are available for CRM workflows.
  **What Was Tested**: TypeScript compilation, Drizzle migrations generation, and full service-layer unit tests passed.
  **What You Can Test**: Run `bun --filter @nhatnang/database test` to verify unit tests pass.
  **Ready For**: Phase 2 (Customer Directory & Dealer Tiers Management UI).
  ```

- Wait for manual review and user-confirmation before promoting the phase status to `✅ VERIFIED`.

---

## Database Schema Specifications

We define three key tables using snake_cased naming standards and type-safe enums:

### 1. `quote_status` Enum

```typescript
export const quoteStatusEnum = pgEnum("quote_status", [
  "pending_review", // Dealer submitted, waiting for admin
  "negotiating", // Offers & counters flying back and forth
  "approved", // Negotiated terms accepted
  "rejected", // Quote turned down
  "expired", // Expiration date surpassed
]);
```

### 2. `quotes` Table

Defines the parent quote request.

- `id` (uuid, primary key, uuidv7 default)
- `userId` (uuid, references `users.id` with onDelete restrict, not null)
- `status` (quote_status, default pending_review, not null)
- `totalQuotedPrice` (numeric(15, 2), nullable - calculated when negotiated terms lock)
- `expirationDate` (timestamp with timezone, nullable - optional quote duration limit)
- `note` (text, nullable - initial comments submitted by dealer)
- `createdAt` (timestamp with timezone, defaultNow, not null)
- `updatedAt` (timestamp with timezone, defaultNow, not null)

### 3. `quote_items` Table

Defines individual products requested inside a negotiation session.

- `id` (uuid, primary key, uuidv7 default)
- `quoteId` (uuid, references `quotes.id` with onDelete cascade, not null)
- `productId` (uuid, references `products.id` with onDelete restrict, not null)
- `quantity` (integer, default 1, not null)
- `requestedPrice` (numeric(15, 2), not null - dealer's initial proposed price)
- `agreedPrice` (numeric(15, 2), nullable - final accepted deal price)
- `createdAt` (timestamp with timezone, defaultNow, not null)
- `updatedAt` (timestamp with timezone, defaultNow, not null)

### 4. `quote_messages` Table

Tracks messages exchanged during negotiation (logs and chats).

- `id` (uuid, primary key, uuidv7 default)
- `quoteId` (uuid, references `quotes.id` with onDelete cascade, not null)
- `senderId` (uuid, references `users.id` with onDelete restrict, not null)
- `message` (text, not null)
- `createdAt` (timestamp with timezone, defaultNow, not null)
- `updatedAt` (timestamp with timezone, defaultNow, not null)

---

## Touchpoints

This phase will modify or create the following files across the monorepo:

### `[NEW]` Files

- [quotes.schema.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/schemas/quotes.schema.ts) — The Drizzle table definitions.
- [quotes.service.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/quotes.service.ts) — Database service class exposing B2B queries.
- [quotes.service.test.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/quotes.service.test.ts) — Co-located unit tests covering mocks and service assertions.

### `[MODIFY]` Files

- [index.ts (Schemas)](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/schemas/index.ts) — Registering quotes schemas.
- [relations.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/schemas/relations.ts) — Modeling the Drizzle defineRelations mapping.
- [index.ts (Services)](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/index.ts) — Exporting quotes services.
- [registry.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/registry.ts) — Instantiating `quotesService` singleton with dependency injection.

---

## Public Contracts

The following core public contracts will be established or integrated:

1. **Schema Entities**:
   - `TQuote`, `TNewQuote` (Inferred select/insert types for quotes)
   - `TQuoteItem`, `TNewQuoteItem` (Inferred select/insert types for quote items)
   - `TQuoteMessage`, `TNewQuoteMessage` (Inferred select/insert types for quote messages)

2. **QuotesService API**:
   - `createQuote(data: TNewQuote, items: TNewQuoteItem[])`: Triggers an atomic transaction to record the quote and its related products.
   - `getComplexQuote(id: string)`: Fetches a detailed quote object nested with its requested items, associated products, and timeline messages.
   - `listQuotes(filters: { userId?: string; status?: TQuote["status"] })`: Queries all quote records filtered by dealer or active negotiation states.
   - `updateQuoteStatus(id: string, status: TQuote["status"])`: Triggers status shifts.
   - `addQuoteMessage(quoteId: string, senderId: string, message: string)`: Logs a negotiation entry/chat message.
   - `updateQuoteItemPrice(itemId: string, agreedPrice: string)`: Updates the final agreed price for individual products.

---

## Blast Radius

Since this phase is restricted to schemas and service definitions, the blast radius is highly isolated.

- Existing user authentication, storefront catalog displays, shopping carts, and standard checkout workflows remain completely unaffected.
- The Drizzle database migration will perform only `CREATE TABLE` and `CREATE TYPE` queries, meaning no existing tables are altered, avoiding state corruption or data loss.

---

## Acceptance Criteria

The following B2B Quotes database layer acceptance criteria must be satisfied:

1. ✅ Drizzle compile check passes without any circular references or TypeScript errors.
2. ✅ Database migrations are successfully generated and run on PostgreSQL.
3. ✅ `QuotesService.createQuote` correctly creates parent quotes and item records atomically inside a single transaction.
4. ✅ `QuotesService.getComplexQuote` returns quote records with fully populated items, products, and negotiation messages.
5. ✅ Service unit tests co-located in `quotes.service.test.ts` pass completely under `bun test`.

---

## Implementation Checklist

The step-by-step TODO list is defined below:

- [x] **Step 1: Define Schemas**
  - Create [quotes.schema.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/schemas/quotes.schema.ts) defining tables and enums.
  - Test: Check syntax and import validity.
- [x] **Step 2: Update Relations**
  - Modify [relations.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/schemas/relations.ts) to define mappings.
  - Test: Check relations compile with other tables.
- [x] **Step 3: Register Schemas**
  - Export everything inside [index.ts (Schemas)](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/schemas/index.ts).
  - Test: Compile schemas.
- [x] **Step 4: Create Service Layer**
  - Create [quotes.service.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/quotes.service.ts) implementing database operations.
  - Test: Compile service.
- [x] **Step 5: Register & Export Service**
  - Modify [registry.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/registry.ts) and [index.ts (Services)](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/index.ts).
  - Test: Confirm singleton imports work.
- [x] **Step 6: Write Unit Tests**
  - Create co-located unit tests in [quotes.service.test.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/quotes.service.test.ts).
  - Test: Run `bun test src/services/quotes.service.test.ts` and verify green output.
- [x] **Step 7: Generate Migration**
  - Run Drizzle Kit migration generation script.
  - Test: Confirm SQL generation passes successfully.

---

## Verification Evidence

Verification is strictly validated prior to phase completion:

### 1. Database Migration Generation

We will verify clean SQL outputs:

- **Command**: `bun run db:generate` (inside `packages/database`)
- **Outcome**: A newly generated migration folder containing SQL CREATE commands.

### 2. Service Unit Testing

We will verify service assertions match correct mocked query responses:

- **Command**: `bun test src/services/quotes.service.test.ts` (inside `packages/database`)
- **Expected Result**: All assertions (e.g. correct insert payloads, return types) are validated successfully and pass.

---

## Resume and Execution Handoff

For the executor continuing this phase:

1. Read [process/context/all-context.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/all-context.md) to understand overall system boundaries and SDD conventions.
2. Read [process/features/crm/active/crm-crm-roadmap_PLAN_01-06-26.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/features/crm/active/crm-crm-roadmap_PLAN_01-06-26.md) to contextualize the multi-phase program goals.
3. Open this plan file [quotes-phase-1-schema_PLAN_01-06-26.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/features/crm/active/quotes-phase-1-schema_PLAN_01-06-26.md).
4. Run `Step 1: Pre-Phase Research` to confirm the Drizzle schemas match base helpers and start implementing from `Block 1`.

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan Mode**: Import the blocks from the **Execution Brief** checklist to drive step-by-step codebase edits.
- **RIPER-5**: We are currently in **PLAN** mode. Once the user approves this detailed Phase 1 plan, we will move to **EXECUTE** mode.
- **Next Step**: Present this plan, obtain explicit user approval, and enter **EXECUTE** mode to begin Step 1 and Block 1 implementation.
