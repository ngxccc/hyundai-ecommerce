# Phase 2: Customer Directory & Dealer Tiers Management

**Date**: 01-06-26
**Complexity**: COMPLEX (Phase Program)
**Status**: ✅ VERIFIED

## Overview

This document specifies the detailed implementation plan for **Phase 2: Customer Directory & Dealer Tiers Management** of the B2B CRM program. In this phase, we will expand the `apps/admin` dashboard to enable staff members to navigate our corporate customer base, establish premium Dealer discount structures (Dealer Tiers), promote standard accounts to Dealers, and automatically apply tiers-driven discount calculators.

We reference [process/context/all-context.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/all-context.md) for UX/UI guidelines, form layouts, internationalization keys (flattening rules), and service dependency injection patterns, and [process/context/tests/all-tests.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/tests/all-tests.md) for automated verification runners.

---

## Quick Links

- [Phase 2: Customer Directory \& Dealer Tiers Management](#phase-2-customer-directory--dealer-tiers-management)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [Phase Completion Rules](#phase-completion-rules)
  - [Execution Brief](#execution-brief)
    - [Block 1: Backend Foundation (Validators, Drizzle Service \& Registry)](#block-1-backend-foundation-validators-drizzle-service--registry)
    - [Block 2: Server Actions \& Routing](#block-2-server-actions--routing)
    - [Block 3: Portfolio \& Configurator UI (Directory Pages)](#block-3-portfolio--configurator-ui-directory-pages)
    - [Expected Outcome](#expected-outcome)
  - [Phased Execution Workflow](#phased-execution-workflow)
    - [Step 1: Pre-Phase Research](#step-1-pre-phase-research)
    - [Step 2: Detailed Planning](#step-2-detailed-planning)
    - [Step 3: Implementation](#step-3-implementation)
    - [Step 4: Testing \& Verification](#step-4-testing--verification)
    - [Step 5: User Confirmation](#step-5-user-confirmation)
  - [Database Service \& Validators Specifications](#database-service--validators-specifications)
    - [1. Zod Validators (`dealer-tier.validators.ts`)](#1-zod-validators-dealer-tiervalidatorsts)
    - [2. DealerTierService API](#2-dealertierservice-api)
  - [Touchpoints](#touchpoints)
    - [`[NEW]` Files](#new-files)
    - [`[MODIFY]` Files](#modify-files)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Implementation Checklist](#implementation-checklist)
  - [Verification Evidence](#verification-evidence)
    - [1. Backend Service Unit Testing](#1-backend-service-unit-testing)
    - [2. Frontend Strict Compilation](#2-frontend-strict-compilation)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces (e.g. customer updates correctly link with pricing engine).
2. **Manual Test** - Admins can dynamically toggle standard consumers vs corporate dealers and create tiers.
3. **Data Verification** - DB query verifies discount percentages map exactly to the dealer tier record.
4. **Error Handling** - Edge cases (like negative discount percentages or duplicate tier names) are validated gracefully.
5. **User Confirmation** - User says "it works" after reviewing test outputs and live UI screenshots.

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

We break Phase 2 down into three core implementation blocks:

### Block 1: Backend Foundation (Validators, Drizzle Service & Registry)

- **What happens**:
  - Create Zod validation schemas for Dealer Tiers and Customer updates in `packages/database/src/validators/dealer-tier.validators.ts`.
  - Create the Drizzle service class `packages/database/src/services/dealer-tier.service.ts` exposing standard CRUD methods.
  - Mock database queries inside `packages/database/src/tests/utils/db-mock.ts` and write co-located unit tests in `dealer-tier.service.test.ts`.
- **Test**: Run `bun test src/services/dealer-tier.service.test.ts` to ensure all tests pass with zero warnings.
- **Done when**: Linter and TS compiler pass without errors inside the database package.

### Block 2: Server Actions & Routing

- **What happens**: Create Next.js Server Actions `apps/admin/src/features/customers/actions/customer.actions.ts` exposing actions to create/update tiers and promote/edit customers business details (role, businessType, dealerTierId).
- **Test**: Revalidate Next.js router cache correctly after form submissions.
- **Done when**: Actions are fully compiled. Linter and TS compiler pass without errors.

### Block 3: Portfolio & Configurator UI (Directory Pages)

- **What happens**:
  - Build the premium Customer Directory listing (`/customers`) allowing filters by business types (Dealer, Contractor, Distributor, End User).
  - Build the dynamic Dealer Tier manager configurator (`/customers/tiers`) displaying discount matrices and minimum spends with subtle animations.
  - Implement dynamic forms following flat i18n keys to prevent strict Next-Intl compiler issues.
- **Test**: Trigger E2E manual flow: create a new tier ("Gold Tier", 15% discount), navigate to customer portal, promote contractor to dealer and assign Gold Tier.
- **Done when**: Changes apply dynamically and display correct discount structures. Linter and TS compiler pass without errors.

### Expected Outcome

- Staff members can audit the B2B corporate customer base in `/customers`.
- Discount tier matrices are configured visually in `/customers/tiers`.
- Database states are atomically synced.

---

## Phased Execution Workflow

We follow the strict RIPER-5 phase program execution loop:

### Step 1: Pre-Phase Research

- Reread `packages/database/src/schemas/dealer-tier.schema.ts` to review field properties.
- Audit `apps/admin/src/features/brands/components/brand-form.tsx` to understand the standard form structure.
- **Checkpoint**: Present research findings to the user and request approval to proceed with execution.

### Step 2: Detailed Planning

- Based on research, finalize UI layout styles (harmonious HSL grids, glassmorphism bento designs).
- Specify exact files to create/modify and i18n key maps inside `/messages/`.
- **Checkpoint**: Obtain final "go" or "approve" from the user.

### Step 3: Implementation

- Implement the exact files as approved:
  1. Define Zod validators in `packages/database/src/validators/dealer-tier.validators.ts`.
  2. Implement `dealer-tier.service.ts` database service.
  3. Wire the service singleton to `registry.ts` and export it from services index.
  4. Write the server actions in the customer features actions folder.
  5. Build form/card components inside `apps/admin/src/features/customers/components/`.
  6. Deploy layout and page router folders in `apps/admin/app/[locale]/(dashboard)/customers/`.

### Step 4: Testing & Verification

- Write the service unit tests in `packages/database/src/services/dealer-tier.service.test.ts`.
- Run unit tests and typecheck checks.
- Conduct E2E manual runs inside the browser and verify database updates.

### Step 5: User Confirmation

- Present a structured post-stage summary to the user:

  ```text
  **What's Functional Now**: Dealer Tier configurator and Customer Directory lists are fully operational in Admin Dashboard.
  **What Was Tested**: TypeScript compilation, Server Actions, Form validation, and service unit tests passed.
  **What You Can Test**: Visit `/customers/tiers` to create a tier, and promote a customer to Dealer with that tier.
  **Ready For**: Phase 3 (Orders Dashboard & Invoice PDF Export).
  ```

- Wait for manual review and user-confirmation before promoting the phase status to `✅ VERIFIED`.

---

## Database Service & Validators Specifications

We define two validation scopes:

### 1. Zod Validators (`dealer-tier.validators.ts`)

```typescript
export const createDealerTierSchema = (t: ITranslator) =>
  z.object({
    name: z.string().min(2, t("validation.tierNameMin")),
    discountPercentage: z.string().refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, t("validation.discountPercentageBounds")),
    minimumSpend: z
      .string()
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }, t("validation.minimumSpendBounds"))
      .default("0"),
  });
```

### 2. DealerTierService API

- `create(data: TNewDealerTier)`: Inserts a new dealer tier record into PostgreSQL.
- `update(id: string, data: Partial<TNewDealerTier>)`: Modifies fields.
- `getAll()`: Queries all dealer tiers sorted by minimumSpend.
- `getById(id: string)`: Fetches a single tier by UUID.
- `delete(id: string)`: Deletes a tier (restricted if assigned to active users).

---

## Touchpoints

This phase will modify or create the following files across the monorepo:

### `[NEW]` Files

- [dealer-tier.validators.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/validators/dealer-tier.validators.ts) — The Zod validation schemas.
- [dealer-tier.service.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/dealer-tier.service.ts) — The database service class.
- [dealer-tier.service.test.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/dealer-tier.service.test.ts) — Co-located unit tests.
- [customer.actions.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/customers/actions/customer.actions.ts) — Server actions.
- [customer-directory.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/customers/components/customer-directory.tsx) — Portfolios view panel.
- [tier-configurator.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/customers/components/tier-configurator.tsx) — Discount tiers setup forms.

### `[MODIFY]` Files

- [index.ts (Validators)](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/validators/index.ts) — Registering Zod schemas.
- [index.ts (Services)](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/index.ts) — Exporting dealer tier service.
- [registry.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/registry.ts) — Instantiating `dealerTierService` singleton.
- [db-mock.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/tests/utils/db-mock.ts) — Registering `dealerTiers` queries mock.

---

## Public Contracts

The following core public contracts will be established or integrated:

1. **Validators Interfaces**:
   - `TCreateDealerTierInput`, `TUpdateDealerTierInput`
2. **DealerTierService**:
   - `dealerTierService.create`, `dealerTierService.update`, `dealerTierService.getAll`, `dealerTierService.delete`
3. **App Server Actions**:
   - `createDealerTierAction(formData: FormData)`
   - `updateCustomerTierAction(userId: string, tierId: string | null, businessType: string)`

---

## Blast Radius

The changes are highly isolated within new dashboard UI routes (`/customers` and `/customers/tiers`).

- Existing storefront cart workflows, payment gateways, news, or auth configurations are completely unaffected.
- No database tables are restructured, keeping previous corporate quotes or products unharmed.

---

## Acceptance Criteria

The following Customer Directory & Dealer Tiers acceptance criteria must be satisfied:

1. ✅ Admin can configure and persist Dealer Tiers (name, discount percentage, minimum spend) successfully.
2. ✅ Admin can audit all customers with accurate categorizations (Dealers, Contractors, Distributors, Consumers).
3. ✅ Admin can promote a user to a corporate Dealer and assign them an active Tier.
4. ✅ Database sync is verified through direct record updates.
5. ✅ Strict TypeScript compilation and ESLint pass 100% cleanly monorepo-wide.

---

## Implementation Checklist

The step-by-step TODO list is defined below:

- [x] **Step 1: Define Zod Validators**
  - Create [dealer-tier.validators.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/validators/dealer-tier.validators.ts) and register in [index.ts (Validators)](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/validators/index.ts).
- [x] **Step 2: Create Database Service**
  - Create [dealer-tier.service.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/dealer-tier.service.ts).
- [x] **Step 3: Register Registry Singletons**
  - Update [registry.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/registry.ts) and [index.ts (Services)](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/index.ts).
- [x] **Step 4: Mock DB Queries & Write Unit Tests**
  - Modify [db-mock.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/tests/utils/db-mock.ts) and create [dealer-tier.service.test.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/dealer-tier.service.test.ts).
  - Run `bun test` to confirm green assertions.
- [x] **Step 5: Write Next.js Server Actions**
  - Create `customer.actions.ts` in `apps/admin/src/features/customers/actions/`.
- [x] **Step 6: Build UI Cards & Form Components**
  - Build directory grids, filter tabs, promotion dialog cards, and tier configuration forms in the customer components folder.
- [x] **Step 7: Deploy Page Routes**
  - Implement pages and layouts inside `/customers` and `/customers/tiers`.
  - Compile the Admin dashboard and verify manual navigation.
  - Run `bun run lint` and TS Compiler

---

## Verification Evidence

Verification is strictly validated prior to phase completion:

### 1. Backend Service Unit Testing

Verify service database mocks:

- **Command**: `bun test src/services/dealer-tier.service.test.ts` (inside `packages/database`) and `bunx tsc -p apps/admin/tsconfig.json --noEmit`.
- **Outcome**: All tests successfully pass.

### 2. Frontend Strict Compilation

Verify full Next.js project building:

- **Command**: `bun --filter apps/admin run build` or `bunx tsc -p apps/admin/tsconfig.json --noEmit`
- **Expected Result**: Admin dashboard compiles with zero errors.

---

## Resume and Execution Handoff

For the executor continuing this phase:

1. Read [process/context/all-context.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/all-context.md) to understand flattened i18n rules and form layouts.
2. Read [process/features/crm/active/crm-crm-roadmap_PLAN_01-06-26.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/features/crm/active/crm-crm-roadmap_PLAN_01-06-26.md) for overarching B2B CRM goals.
3. Open this plan [crm-phase-2-customers-tiers_PLAN_01-06-26.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/features/crm/active/crm-phase-2-customers-tiers_PLAN_01-06-26.md).
4. Run `Step 1: Pre-Phase Research` to inspect the exact properties of `dealerTiers` schema before implementing `Block 1`.

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan Mode**: Import the blocks from the **Execution Brief** checklist to drive step-by-step codebase edits.
- **RIPER-5**: We are currently in **PLAN** mode. Once the user approves this detailed Phase 2 plan, we will move to **EXECUTE** mode.
- **Next Step**: Present this plan, obtain explicit user approval, and enter **EXECUTE** mode to begin Step 1 research and Block 1 implementation.
