# Standardize Catalog Sort Query Parameters Plan

**Date**: June 12, 2026
**Complexity**: SIMPLE
**Implementation Approach**: Database Type Alignment + Storefront UI Refactoring
**Execution Model**: Single phase with tests & build verification
**Status**: ⏳ PLANNED

---

## Overview

This plan outlines the standardizing of the catalog sorting query parameters from snake_case (`price_asc` and `price_desc`) to camelCase (`priceAsc` and `priceDesc`). This aligns the storefront query parameters with standard JavaScript naming conventions and ensures consistency across API layers, service interfaces, database queries, and unit tests.

This plan is created in accordance with `process/context/all-context.md`.

---

## Touchpoints

- **Database Package (`packages/database`)**:
  - `packages/database/src/services/interfaces.ts` (TGetAllOptions sort field type signature)
  - `packages/database/src/services/product.service.ts` (Sorting clauses and cursor pagination mapping)
  - `packages/database/src/services/product.service.test.ts` (Unit test cases and assertions)
- **Storefront App (`apps/storefront`)**:
  - `apps/storefront/src/features/products/components/product-sort.tsx` (Select dropdown values and labels mapping)
  - `apps/storefront/messages/en.json` (English translation JSON keys)
  - `apps/storefront/messages/vi.json` (Vietnamese translation JSON keys)

---

## Public Contracts

### Interfaces Type Signature Change

In `packages/database/src/services/interfaces.ts`, the `TGetAllOptions` sort type definition will change:

```typescript
// Before
sort?: "price_asc" | "price_desc" | "newest" | undefined;

// After
sort?: "priceAsc" | "priceDesc" | "newest" | undefined;
```

---

## Blast Radius

- **URL Bookmarks and Search Engine Indexes**:
  - Direct request to `/products?sort=price_asc` will not be recognized, and will default back to `newest` sorting. This is safe, non-destructive, and acceptable since it's a soft-fallback.
- **Database Unit Tests**:
  - Service unit tests that assert `price_asc` behavior will fail until test cases are updated.

---

## Phase Completion Rules

Every phase defined in this plan must be verified and checked in full before advancing:
1. **Types Safety**: Running `bun turbo run check-types` must succeed with zero TypeScript compiler errors.
2. **Post-Phase Testing**: Run the unit test suite (`bun test packages/database/src/services/product.service.test.ts`) to ensure sorting logic in the database layer is correct.
3. **Lint Verification**: Running `bun run lint` must pass with zero formatting or architectural restricted imports warnings.

---

## Acceptance Criteria

- **AC 1: Type Safety**: `TGetAllOptions` sort field is updated and compiles under TypeScript with strict checks.
- **AC 2: Database Layer Compliance**: `productService.getAll` correctly handles `priceAsc` and `priceDesc` to output SQL `asc(products.price)` and `desc(products.price)`.
- **AC 3: Storefront UI Compliance**: Selecting "Giá: Thấp đến Cao" updates the URL parameter to `?sort=priceAsc` and "Giá: Cao đến Thấp" updates to `?sort=priceDesc`.
- **AC 4: Multi-Language Translation**: Translations are loaded using the keys `Catalog.sort.priceAsc` and `Catalog.sort.priceDesc` with zero warnings from next-intl.
- **AC 5: Testing & Build**: All database unit tests pass, and storefront production build succeeds.

---

## Implementation Checklist

### Phase 1: Standardization & Verification
- [ ] Update type signature in `packages/database/src/services/interfaces.ts` to use camelCase sort parameters.
- [ ] Refactor conditional sorting logic and cursor pagination checks inside `packages/database/src/services/product.service.ts`.
- [ ] Update unit tests in `packages/database/src/services/product.service.test.ts` to match camelCase parameters.
- [ ] Run database package unit tests:
  ```bash
  bun test packages/database/src/services/product.service.test.ts
  ```
- [ ] Rename translation keys `price_asc` and `price_desc` to `priceAsc` and `priceDesc` in `apps/storefront/messages/en.json` and `vi.json`.
- [ ] Update `apps/storefront/src/features/products/components/product-sort.tsx` to map local labels and select items to camelCase sorting keys.
- [ ] Verify storefront compilation and linting:
  ```bash
  bun turbo run check-types --filter=storefront && bun run lint --filter=storefront
  ```
- [ ] Build storefront application:
  ```bash
  bun turbo run build --filter=storefront
  ```

---

## Verification Evidence

### 1. Database Package Unit Tests
```bash
bun test packages/database/src/services/product.service.test.ts
```
Expected: All tests pass.

### 2. Storefront Build Check
```bash
bun turbo run build --filter=storefront
```
Expected: Successful Turbopack production compilation.

---

## Resume and Execution Handoff

1. Locate this plan at `process/general-plans/active/standardize-sort-params_PLAN_12-06-26.md`.
2. Update `packages/database/src/services/interfaces.ts` and `product.service.ts` first.
3. Keep sorting cursors correct: verify `priceAsc` and `priceDesc` generate database pagination markers properly.

**Next Step**: Review this plan, approve for execution, then enter EXECUTE mode.
