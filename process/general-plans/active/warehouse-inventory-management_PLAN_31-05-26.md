# PLAN: Warehouse & Inventory Management

Date: 31-05-26
Complexity: Complex (Standard)
Status: ⏳ PLANNED

## Overview

Based on the [Admin App Features Roadmap](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/general-plans/active/admin-features-roadmap_PLAN_30-05-26.md), this plan details the implementation of the Warehouse & Inventory Management module for the `apps/admin` application. This feature allows administrators to manage physical warehouses and track the stock quantities (`warehouseStocks`) of products across these locations. This is crucial for selling heavy industrial machinery.

---

## Quick Links

- [PLAN: Warehouse \& Inventory Management](#plan-warehouse--inventory-management)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [1. Context and Goals](#1-context-and-goals)
  - [Phase Completion Rules](#phase-completion-rules)
  - [Execution Brief](#execution-brief)
    - [Phase 1: Database Services \& Validation](#phase-1-database-services--validation)
    - [Phase 2: Warehouse Management UI (CRUD)](#phase-2-warehouse-management-ui-crud)
    - [Phase 3: Inventory Stock Management UI](#phase-3-inventory-stock-management-ui)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Phased Execution Workflow](#phased-execution-workflow)
  - [Architecture Decisions (Final)](#architecture-decisions-final)
    - [AD-001: Fat Service Pattern for Warehouses](#ad-001-fat-service-pattern-for-warehouses)
    - [AD-002: Soft Deletion via `isActive`](#ad-002-soft-deletion-via-isactive)
  - [Component Details](#component-details)
  - [Database Schema](#database-schema)
  - [RFCs](#rfcs)
    - [RFC-001: Database Services \& Validation](#rfc-001-database-services--validation)
    - [RFC-002: Warehouse Management UI](#rfc-002-warehouse-management-ui)
    - [RFC-003: Inventory Stock Management UI](#rfc-003-inventory-stock-management-ui)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Verification Evidence](#verification-evidence)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## 1. Context and Goals

The E-commerce platform needs a robust way to track heavy machinery across multiple physical locations before enabling the sales and fulfillment workflows.

**In-scope**:

- Warehouse CRUD operations (List, Create, Update, Soft-delete/Deactivate).
- Inventory Management interface to adjust stock levels (`stock`, `minStockWarning`) for products per warehouse.
- Server Actions for all mutations using Zod validation schemas.
- Fat Service implementations in `packages/database/src/services/warehouse.service.ts` and `packages/database/src/services/warehouse-stock.service.ts`.
- Co-located unit tests for services using `bun:test`.

**Out-of-scope (V1)**:

- Automated stock deductions from orders (to be handled in the Order Management Phase).
- Multi-warehouse routing logic for shipping calculations.
- Bulk import/export of stock levels via CSV.

---

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces
2. **Manual Test** - User can perform the action
3. **Data Verification** - Database/state changes confirmed
4. **Error Handling** - Failure cases handled gracefully
5. **User Confirmation** - User says "it works"

Status meanings:

- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working
- 🚧 BLOCKED - Has issues

After each phase, document:

- [ ] What was tested manually
- [ ] Data verified in DB (show query + result)
- [ ] Errors encountered and fixed
- [ ] User confirmation received

---

## Execution Brief

### Phase 1: Database Services & Validation

**What happens:** Create Zod schemas in `packages/database/src/validators/` for warehouses and warehouse stocks. Implement Fat Services (`WarehouseService` and `WarehouseStockService`) in `packages/database/src/services/` with co-located unit tests.
**Integration points:** Connects to Drizzle ORM schemas `warehouses` and `warehouseStocks`.
**Test:** Create test file for new service and run `bun test` in `packages/database` for the new services.
**Verify:** Unit tests pass, covering CRUD operations and constraint validations.
**Done when:** All tests are green and user confirms the service layer is robust.

### Phase 2: Warehouse Management UI (CRUD)

**What happens:** Build the Admin UI pages in `apps/admin/app/[locale]/(dashboard)/warehouses`. Implement Next.js Server Actions for creating, updating, and deactivating warehouses. Build a data table for listing warehouses.
**Integration points:** Connects Admin UI components to the new `WarehouseService`.
**Test:** Manually create, edit, and deactivate a warehouse via the UI.
**Verify:** Check the `warehouse` table in the database to ensure records are accurately updated.
**Done when:** User can successfully manage warehouses via the Admin Dashboard.

### Phase 3: Inventory Stock Management UI

**What happens:** Build the Inventory UI, likely as a sub-view within Product details (`apps/admin/app/[locale]/(dashboard)/products/[id]/inventory`) or a dedicated global inventory matrix. Implement Server Actions to adjust `stock` and `minStockWarning`.
**Integration points:** Connects Product Management with Warehouse Management via `WarehouseStockService`.
**Test:** Adjust stock for a product in a specific warehouse and verify warnings.
**Verify:** Check the `warehouse_stock` table in the database to ensure quantities reflect the UI changes.
**Done when:** User can view and update stock levels for products across active warehouses.

**Expected Outcome:**

- Fully functional Warehouse listing and management UI.
- Ability to assign and update product stock quantities per warehouse.
- Rock-solid backend services with 100% unit test coverage.

---

## Acceptance Criteria

- [ ] Admins can view a paginated/scrollable list of all warehouses.
- [ ] Admins can create a new warehouse providing name, street address, city, and district.
- [ ] Admins can edit an existing warehouse's details.
- [ ] Admins can deactivate (soft-delete) a warehouse without breaking historical associations.
- [ ] Admins can view stock levels for a specific product across all active warehouses.
- [ ] Admins can update stock quantity and minimum stock warning threshold for a product in a warehouse.
- [ ] All database interactions are routed through Fat Services (`WarehouseService`, `WarehouseStockService`).
- [ ] All inputs are validated via Zod schemas (as defined in `process/context/all-context.md` architectural guidelines).

---

## Phased Execution Workflow

**IMPORTANT**: This plan uses a phase-by-phase execution model with built-in verification gates.
For each RFC/Phase, follow this workflow:

- **Step 1: Pre-Phase Research** - Read existing code patterns in `packages/database/src/services` and `apps/admin/src/app`, analyze similar implementations (like Categories/Brands), present findings to user. **CRITICAL: Present findings and STOP. Wait for user approval before proceeding to Step 2.**
- **Step 2: Detailed Planning** - Specify exact files to create/modify, define success criteria, get user approval.
- **Step 3: Implementation** - Execute approved plan exactly as specified.
- **Step 4: Testing & Verification** - Execute specific test scenarios, verify in database, document results.
- **Step 5: User Confirmation** - Present a structured post-stage summary for user to manually test and approve.
  **CRITICAL: Do NOT proceed to next phase until current phase is ✅ VERIFIED**

---

## Architecture Decisions (Final)

### AD-001: Fat Service Pattern for Warehouses

**Decision**: Implement all database logic inside `WarehouseService` and `WarehouseStockService`, following the SDD (Schema-Driven Design) and Fat Service architectural guidelines.
**Rationale**: Avoids bloated `queries/` folders for simple CRUD. Keeps logic centralized.

### AD-002: Soft Deletion via `isActive`

**Decision**: Warehouses will not be hard-deleted to preserve historical order/stock data integrity. They will be toggled via the `isActive` boolean.
**Rationale**: E-commerce systems must retain historical location data for past orders even if a physical warehouse closes.

---

## Component Details

- **Warehouse Data Table**: Uses standard Admin UI patterns (shadcn/ui tables) to list `id`, `name`, `city`, `district`, and `isActive` status.
- **Warehouse Form**: A modal or dedicated page to input `name`, `streetAddress`, `district`, `city`. Uses Zod for client/server validation.
- **Stock Management Form**: A matrix or list view displaying all active warehouses for a given Product, allowing inline editing of `stock` and `minStockWarning`.

---

## Database Schema

Located in `packages/database/src/schemas/`:

- `warehouses` (`warehouse.schema.ts`): `id`, `name`, `streetAddress`, `district`, `city`, `isActive`.
- `warehouseStocks` (`warehouse-stock.schema.ts`): `warehouseId`, `productId`, `stock`, `minStockWarning`. (Composite Primary Key).

---

## RFCs

### RFC-001: Database Services & Validation

**Stage 0: Pre-Phase Research**

- Read `packages/database/src/services/registry.ts` to understand service injection.
- Analyze existing Zod schemas in `packages/database/src/validators/`.
- Present findings and wait for user approval.

**Stages:**

- [x] Create `warehouse.validator.ts` and `warehouse-stock.validator.ts`.
- [x] Implement `warehouse.service.ts` and `warehouse-stock.service.ts`.
- [x] Write `warehouse.service.test.ts` and `warehouse-stock.service.test.ts`.
- [x] Register services in `registry.ts`.

**Post-Phase Testing:**

- [x] Run `bun test` and `bunx tsc -p tsconfig.json --noEmit` in `packages/database`.
- Expected behavior: All CRUD and validation tests pass.
- Verification checklist:
  - [x] Manual test passed (via unit tests).
  - [x] Data in DB verified (test DB).
  - [ ] User confirmed working.

### RFC-002: Warehouse Management UI

**Stage 0: Pre-Phase Research**

- Review `apps/admin` routing structure and standard data table/form implementations (e.g., from Categories/Brands).
- Present findings and wait for user approval.

**Stages:**

- Create Server Actions for Warehouse CRUD.
- Build Warehouse listing page (`/warehouses`).
- Build Create/Edit Warehouse forms/dialogs.

**Post-Phase Testing:**

- Manual test steps: Navigate to `/warehouses`, create a new warehouse, edit it, and deactivate it.
- Expected behavior: UI updates optimistically or revalidates correctly. Database reflects changes.
- Verification checklist:
  - [ ] Manual test passed.
  - [ ] Data in DB verified (`SELECT * FROM warehouse`).
  - [ ] User confirmed working.

### RFC-003: Inventory Stock Management UI

**Stage 0: Pre-Phase Research**

- Decide UI location with user: Global Inventory page vs. Product Detail sub-tab.
- Present findings and wait for user approval.

**Stages:**

- Create Server Actions for updating `warehouseStocks`.
- Build the Stock Management UI component.
- Integrate it into the chosen location.

**Post-Phase Testing:**

- Manual test steps: Navigate to a product's inventory view. Update stock count for a specific warehouse.
- Expected behavior: Changes save successfully, reflecting immediately in the UI.
- Verification checklist:
  - [ ] Manual test passed.
  - [ ] Data in DB verified (`SELECT * FROM warehouse_stock`).
  - [ ] User confirmed working.

---

## Touchpoints

- `packages/database/src/validators/`
- `packages/database/src/services/`
- `apps/admin/app/[locale]/(dashboard)/warehouses/`
- `apps/admin/src/features/warehouses/` (or similar feature structure)

## Public Contracts

- **Zod Schemas**: Shared between Server Actions and Client Forms.
- **Service Interfaces**: Returned types from `WarehouseService` methods (using `TWarehouse` and `TWarehouseStock`).

## Blast Radius

- The changes are additive. Existing Product and Category logic remains untouched, though Product views may be extended to include Inventory tabs.
- No impact on storefront in Phase 1 since storefront does not currently display live warehouse routing.

## Verification Evidence

- Unit test outputs for the new services.
- Screenshots of the working Admin UI (Data Table and Forms).
- SQL query logs showing successful inserts/updates in `warehouse` and `warehouse_stock` tables.

## Resume and Execution Handoff

To execute this plan:

1. Ensure the database is up-to-date with migrations.
2. The executor should begin with **RFC-001: Database Services & Validation**, conducting the **Pre-Phase Research** and presenting it before writing any code.

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan mode:** Import the Execution Brief steps directly. Execute by Phase.
- **RIPER-5:**
  - **RESEARCH**: Start by understanding the DB injection pattern in `packages/database/src/services/registry.ts`.
  - **EXECUTE**: Follow the Phased Execution Workflow rigorously. DO NOT bundle research and implementation.
  - **VERIFY**: After each phase, stop and run the verification checklist.
  - **After each phase: STOP and verify before proceeding.**

**User Review Required:**
Please review this implementation plan for the Warehouse & Inventory Management module. Are you satisfied with the phased approach (Services -> Warehouse UI -> Stock UI)? If yes, please type **"go"** or indicate approval to begin Execution.
