# Database Services Directory Refactoring Plan

**Date**: June 12, 2026
**Complexity**: SIMPLE
**Implementation Approach**: Domain-based Subfolders Reorganization
**Execution Model**: Folder Reorganization followed by Interface/Registry Path Mapping
**Status**: ⏳ PLANNED (Backlog)

---

## Overview

This implementation plan outlines the reorganization of the flat services directory `packages/database/src/services/` into clean, domain-based subfolders (e.g., `auth/`, `product/`, `order/`). This improves codebase scalability and groups service implementations alongside their corresponding test specifications, while preserving 100% backward compatibility via the central services entrypoint.

This plan relies on the repository context defined in `process/context/all-context.md`.

---

## Touchpoints

- **Database Package (`packages/database`)**:
  - `packages/database/src/services/` (all service files, tests, and configuration helper files)
  - `packages/database/src/services/index.ts` (export entrypoint)
  - `packages/database/src/services/registry.ts` (service instantiation registry)

---

## Public Contracts

### Exports Entrypoint

The unified exports entrypoint `packages/database/src/services/index.ts` will remain the public contract for external consumers:

```typescript
// packages/database/src/services/index.ts
export * from "./registry";
export * from "./auth/auth.service";
export * from "./product/product.service";
export * from "./user/user.service";
export * from "./order/order.service";
// Remaining services exported from subfolders...
```

Any external application (e.g., `storefront` or `admin`) importing service instances via `import { productService } from "@nhatnang/database/services"` will continue to work without code changes.

---

## Blast Radius

1. **Internal Service Imports**:
   - Class files importing shared types or DB client from sibling locations will need their relative import paths updated (e.g., `../client` instead of `./client`).
2. **Registry Instantiation Path Map**:
   - `packages/database/src/services/registry.ts` must be updated to import classes from the new subfolders.
3. **Tests Configuration**:
   - Any test suite relying on global relative setup paths must have paths verified.

---

## Phase Completion Rules

Every phase defined in this plan must be verified and checked in full before advancing:

1. **Types Safety**: Running `bun turbo run check-types` must succeed with zero TypeScript compiler errors.
2. **Test Integrity**: Running database package tests must succeed.

---

## Acceptance Criteria

- **AC 1: Reorganized Structure**: Service source code and test files are grouped in dedicated subfolders:
  - `auth/` (`auth.service.ts`, `auth.service.test.ts`)
  - `product/` (`product.service.ts`, `product.service.test.ts`)
  - `order/` (`order.service.ts`, `order.service.test.ts`, `order.service.integration.test.ts`)
  - `category/`, `brand/`, `warehouse/`, `warehouse-stock/`, `quotes/`, `dealer-tier/`, `user/`
- **AC 2: Unified Registry**: Root files `interfaces.ts`, `registry.ts`, and `index.ts` are updated with correct import paths and export service bindings.
- **AC 3: Compile Pass**: The entire monorepo typechecks and builds successfully.
- **AC 4: Test Coverage**: All unit and integration database tests pass without errors.

---

## Implementation Checklist

### Phase 1: Folder Reorganization

- [ ] Create domain folders under `packages/database/src/services/`.
- [ ] Move service files and their tests into their respective subfolders.
- [ ] Update internal relative imports inside service and test files.
- [ ] Update import paths in `packages/database/src/services/registry.ts`.
- [ ] Update export paths in `packages/database/src/services/index.ts`.

### Phase 2: Verification

- [ ] Run `bun turbo run check-types` to verify compilation.
- [ ] Run database tests: `bun --cwd packages/database test` to verify execution.

---

## Verification Evidence

Validation and testing instructions are aligned with the guidelines in `process/context/tests/all-tests.md` and `tests.md`:

### 1. Compilation Verification

Verify typecheck across the monorepo:

```bash
bun turbo run check-types
```

Must compile with zero errors.

### 2. Test Execution Verification

Run all database package tests:

```bash
bun --cwd packages/database test
```

All unit and integration tests must pass successfully.

---

## Resume and Execution Handoff

1. Locate this plan at `process/general-plans/backlog/database-services-refactor_PLAN_12-06-26.md`.
2. Start with **Phase 1: Folder Reorganization** by moving service files and tests into subfolders.
3. Validate by executing the check-types and test runner verification gates.

**Next Step**: Review this plan, approve for execution, then enter EXECUTE mode.
