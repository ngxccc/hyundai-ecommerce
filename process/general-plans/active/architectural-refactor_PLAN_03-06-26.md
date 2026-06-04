# Architectural Refactor & Principles Alignment Plan

**Date**: 03-06-26
**Complexity**: COMPLEX (Multi-phase)
**Implementation Approach**: Structural refactoring across database package, admin server actions, and storefront application.
**Execution Model**: Phase-by-Phase with Pre-Research and Post-Testing

---

## Overview

This plan details the roadmap to resolve architectural debt, violations of software engineering principles (DRY, Separation of Concerns, SOLID, KISS, YAGNI), and package dependency issues discovered during the workspace-wide audit. The goal is to clean up code duplication, enforce strict boundary layers, and improve test isolation without breaking existing functionalities.

**Status**: ⏳ IN_PROGRESS

---

## Quick Links

- [Context and Goals](#1-context-and-goals)
- [Phase Completion Rules](#2-phase-completion-rules)
- [Execution Brief](#3-execution-brief)
- [Phased Execution Workflow](#4-phased-execution-workflow)
- [Architecture Decisions](#5-architecture-decisions)
- [Phased Delivery Plan](#6-phased-delivery-plan)
- [RFCs](#7-rfcs)
- [Implementation Checklist](#8-implementation-checklist)

---

## 1. Context and Goals

During the codebase audit, several critical violations of DRY, SoC, SOLID, KISS, and YAGNI were identified:

- Duplicate CRUD boilerplate and try-catch error mappings in the database service layer.
- Raw Drizzle ORM entity leakage from Server Actions into presentation UI components.
- Coupling of UI translation keys and UI component packages inside the database validator schemas.
- Complete duplicate set of shadcn/ui components and basic utility helpers within the storefront application.
- Tight coupling on database query builder execution in unit tests rather than verifying service outcomes.
- Dead code, including unused database prepared statements and inconsistent/unused package types.

This refactor will systematically remove these violations, establish clean data transfer boundaries, decouple database validators from UI presentation concerns, and align test mocking practices.

---

## 2. Phase Completion Rules

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

## 3. Execution Brief

### Phase 1: Service Layer DRY Refactor (Boilerplate & Exception Handling)

- **What happens**: Create generic database service helper functions or a base class to abstract shared query actions and standardize error mappings (e.g. mapping PostgreSQL unique constraints to custom domain exceptions). Refactor `BrandService`, `CategoryService`, and `WarehouseService` to use these helpers.
- **Test**: Service test suites run successfully. Unique constraint errors trigger the correct formatted exceptions.

### Phase 2: Separation of Concerns (DTO Sanitization at Action boundaries)

- **What happens**: Establish a DTO layer in `packages/database/src/dtos/` to convert raw Drizzle entity structures to UI-safe data transfer objects. Refactor Server Actions in `apps/admin/src/features/` (products, brands, categories, warehouses) to return sanitized DTOs.
- **Test**: Admin pages render and function correctly. Check that actions do not expose internal ORM columns to frontend states.

### Phase 3: Separation of Concerns (Validator Purification & UI Decoupling)

- **What happens**: Clean up validator schemas in `packages/database/src/validators/` to remove UI-specific localization keys and replace them with standard domain errors. Replace the dependency on `@nhatnang/ui` in `product.validators.ts` by importing types directly from `@tiptap/core`.
- **Test**: Re-run validator-routing dependency tests. Ensure the package dependency cycle is fully eliminated.

### Phase 4: Storefront UI Clean Up (Deduplication & DRY Components)

- **What happens**: Add `@nhatnang/ui` and `@nhatnang/shared` dependencies to `apps/storefront/package.json`. Delete the 12 local duplicate shadcn/ui components under `apps/storefront/src/shared/components/ui/` and local duplicate helpers. Redirect all imports to use shared workspace packages.
- **Test**: Storefront compiles and builds successfully. Verify login/register forms and home carousel pages function properly.

### Phase 5: SOLID Alignment (Dependency Injection, Service Interfaces, decoupled AuthService)

- **What happens**: Refactor `AuthService` to accept and execute auth actions via injected providers or parameters rather than global static imports. Standardize and declare missing service interfaces (`IUserService`, `IOrderService`, `IQuotesService`).
- **Test**: Auth service tests and action tests pass cleanly.

### Phase 6: YAGNI Clean Up (Dead Code & Unused Types)

- **What happens**: Delete the 3 unused prepared statements in `OrderService`. Delete or align `ProductSpecs` inside `@nhatnang/types` with the real Zod validators.
- **Test**: Workspace-wide typechecking and linter compile green.

---

## 4. Phased Execution Workflow

**IMPORTANT**: This plan uses a phase-by-phase execution model with built-in verification gates. Each RFC follows this workflow:

### Step 1: Pre-Phase Research

- Read existing code patterns in codebase
- Analyze similar implementations
- Identify potential blockers or unknowns
- Present findings to user for review
- **CRITICAL: Present findings and STOP. Wait for user approval before proceeding to Step 2. Do NOT bundle research + implementation into one agent call.**

### Step 2: Detailed Planning

- Based on research, create detailed implementation steps
- Specify exact files to create/modify
- Define success criteria
- Get user approval before proceeding

### Step 3: Implementation

- Execute approved plan exactly as specified
- No deviations from approved approach
- Mid-phase check-in if phase is long (>2 hours)

### Step 4: Testing & Verification

- Execute specific test scenarios
- Verify all acceptance criteria met
- Document any issues or deviations
- Show results to user

### Step 5: User Confirmation

- After each stage, the executor MUST present a structured post-stage summary and wait for approval to proceed.

---

## 5. Architecture Decisions

### AD-001: Centralized Exception Mapping for Database Services

- **Decision**: Introduce a central error mapper utility (`packages/database/src/errors/error-mapper.ts`) to intercept raw database exceptions and map them to domain-specific errors.
- **Rationale**: Keeps database services compliant with DRY and SRP by removing duplicate try-catch blocks and constraint mapping logic.

### AD-002: Action DTO Layer

- **Decision**: Return custom interfaces (DTOs) from Server Actions to the UI components.
- **Rationale**: Decouples UI presentation columns from database schema definitions, complying with Separation of Concerns.

### AD-003: Validator Purification

- **Decision**: Remove UI translation key strings from database validator files. The UI/application layer will map validator issues to localized strings.
- **Rationale**: Eliminates the coupling between database validator logic and presentation-layer translation files.

---

## 6. Phased Delivery Plan

### Current Status

- Phase 1: ✅ VERIFIED
- Phase 2: ✅ VERIFIED
- Phase 3: ✅ VERIFIED
- Phase 4: ✅ VERIFIED
- Phase 5: ✅ VERIFIED
- Phase 6: ⏳ PLANNED

---

## 7. RFCs

### RFC-001: Database Services CRUD & Error Mapping DRY Refactor

- **Objective**: Standardize service error catching and abstract CRUD helper patterns.
- **Pre-Phase Research**: Read `brand.service.ts`, `category.service.ts`, `warehouse.service.ts`.
- **Test Stage**:
  - Test file path: `packages/database/src/services/*.test.ts`
  - Run command: `bun test src/services/`
  - Pass criteria: All 53 tests pass.

### RFC-002: Action-to-DTO Sanitization

- **Objective**: Prevent Drizzle ORM schemas from leaking into client-side action results.
- **Pre-Phase Research**: Read `apps/admin/src/features/products/actions/product.actions.ts` and related features.
- **Test Stage**:
  - Run command: `bunx turbo run test`

### RFC-003: Validator Purification & Dependency Cycle Resolution

- **Objective**: Purify validators from UI keys and remove `@nhatnang/ui` import in `product.validators.ts`.
- **Pre-Phase Research**: Read `packages/database/src/validators/*`.
- **Test Stage**:
  - Run command: `node .claude/skills/vc-audit-context/scripts/validate-context-discovery.mjs`

### RFC-004: Storefront UI Deduplication

- **Objective**: Delete duplicate components in storefront and link `@nhatnang/ui`.
- **Pre-Phase Research**: Check `apps/storefront/src/shared/components/ui/` files.
- **Test Stage**:
  - Run command: `bun run lint && bun run build`

### RFC-005: Dependency Injection & Auth Decoupling

- **Objective**: Introduce constructor injection for `AuthService` and declare service interfaces.
- **Pre-Phase Research**: Read `auth.service.ts`.
- **Test Stage**:
  - Run command: `bun test src/services/auth.service.test.ts`

### RFC-006: YAGNI Clean Up

- **Objective**: Remove unused prepared statements and align `@nhatnang/types` specs.
- **Pre-Phase Research**: Read `OrderService` lines 27-45.
- **Test Stage**:
  - Run command: `bun run lint`

---

## 8. Implementation Checklist

- [x] **RFC-001: Service DRY Refactor**
  - [x] Research and map error-handling try-catch structures inside `packages/database/src/services/`
  - [x] Create centralized error mapping utility `packages/database/src/errors/db-errors.ts`
  - [x] Refactor services (`brand`, `category`, `warehouse`) to use the centralized error helper
  - [x] Run `bun test src/services/` to verify services remain verified
- [x] **RFC-002: Action DTO Layer**
  - [x] Define DTO helper interfaces in `packages/database/src/dtos/`
  - [x] Map services return data in `product`, `brand`, `category`, `warehouse` actions to DTOs
  - [x] Verify admin application compiling and tests passing
- [x] **RFC-003: Validator Purification**
  - [x] Purify database validators to contain raw translation keys (e.g., `"validation.nameRequired"`) as default messages, keeping them unified and DRY
  - [x] Add `isActive: z.boolean().default(true)` to `createBrandSchema` and `createCategorySchema` to support full schema coverage
  - [x] Import `JSONContent` directly from `@tiptap/core` inside `product.validators.ts` to sever UI dependency cleanly
  - [x] Create a generic, reuseable `translatedZodResolver` in both admin and storefront apps to walk and translate validation error keys at the form submission boundary
  - [x] Delete all redundant client-side feature validator files from `apps/` to prevent DRY violations
  - [x] Update action handlers to cast translation key parameter as `never` (e.g., `t(key as never)`) to resolve Zod v4 overloaded next-intl translation signature type errors
  - [x] Update the Zod skill files (`SKILL.md`, `zod-best-practices.md`) with Zod v4 specific guidelines and github discussion note
- [x] **RFC-004: Storefront UI Deduplication**
  - [x] Add `@nhatnang/ui` and `@nhatnang/shared` to `apps/storefront/package.json` dependencies
  - [x] Delete local duplicate components folder `apps/storefront/src/shared/components/ui/`
  - [x] Update imports across storefront pages/components to target workspace packages
  - [x] Run `bun run lint` and `bun run build` at root
- [x] **RFC-005: Dependency Injection & Interfaces**
  - [x] Refactor `AuthService` constructor to inject database client and decouple static auth calls
  - [x] Declare and standardize service interfaces in packages/database/src/services/interfaces.ts
- [ ] **RFC-006: YAGNI Clean Up**
  - [ ] Remove unused prepared statements inside `packages/database/src/services/order.service.ts`
  - [ ] Remove or align unused `ProductSpecs` inside `@nhatnang/types/src/product.types.ts`
  - [ ] Final compilation and verification check

## Touchpoints

- **Packages & Apps**:
  - `packages/database` (Services, Validators, Tests, Mocks)
  - `packages/types` (Product Types)
  - `apps/admin` (Server Actions)
  - `apps/storefront` (Workspace Dependencies, local component folders, layout imports)
- **Key Files**:
  - `packages/database/src/services/brand.service.ts`
  - `packages/database/src/services/category.service.ts`
  - `packages/database/src/services/warehouse.service.ts`
  - `packages/database/src/services/auth.service.ts`
  - `packages/database/src/services/order.service.ts`
  - `packages/database/src/validators/product.validators.ts`
  - `packages/database/src/validators/auth.validators.ts`
  - `packages/database/src/validators/order.validators.ts`
  - `apps/storefront/package.json`
  - `apps/storefront/src/shared/lib/utils.ts`

## Public Contracts

- **Server Actions Return Types**:
  - Instead of returning raw database schema rows (`typeof products.$inferSelect`), actions will return mapped DTO types (`TProductDTO`, `TBrandDTO`, etc.).
- **Validator Declarations**:
  - Zod schemas in `packages/database/src/validators/` will no longer take translator arguments or return UI translation keys. They will fail with standard Zod issues.
- **Service Interfaces**:
  - Instantiated services (`orderService`, `quotesService`, etc.) in `packages/database/src/services/registry.ts` will conform to explicitly defined service interfaces rather than raw class typings.

## Blast Radius

- **UI Rendering & Hydration**:
  - Changes in Server Action return types (DTOs instead of raw DB entities) might affect fields referenced in Admin components.
- **Storefront Component Imports**:
  - Deleting duplicate shadcn/ui components in `apps/storefront/src/shared/components/ui/` requires updating all references in storefront pages/components to import from `@nhatnang/ui/components/ui`.
- **Unit & Integration Tests**:
  - Changes to service mocks and dependency injection require adjusting how service mocks are constructed in action unit tests.

## Verification Evidence

- **Manual Testing**:
  - Verify storefront login, register, home carousel, and product listing pages render correctly.
  - Verify admin product creation, customer directory, and order lists function.
- **Automated Verification**:
  - Run the workspace unit test suites: `bunx turbo run test` (must pass 100%).
  - Run workspace linter: `bun run lint` (must compile cleanly).
- **Post-Phase Testing**:
  - Refers to testing guidelines in `process/context/tests/all-tests.md` and context routing in `process/context/all-context.md`.

## Resume and Execution Handoff

- **State of Execution**:
  - Currently in the `PLAN` phase of RIPER-5. All code remains untouched.
- **Next Steps**:
  - The executing agent must start with `RFC-001` (Service DRY Refactor), researching the try-catch structures and creating `packages/database/src/errors/db-errors.ts`.
- **References**:
  - Consult `process/context/all-context.md` for overall architecture, and `process/context/tests/all-tests.md` for test setups.

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan mode**: Import this plan to follow RFC checklists.
- **RIPER-5**: RESEARCH → INNOVATE → PLAN completed. Request "ENTER EXECUTE MODE" to proceed with RFC-001.
- **Verification Requirement**: Each phase requires explicit validation before proceeding to the next.
