# Admin Header Search Refactor and Category Card Enhancement

Date: 30-05-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

This plan details the removal of search bars from the global `CategoryHeader` and `BrandHeader` components, replacing them with page-level `CategoryFilters` and `BrandFilters` to match the UX of `ProductFilters`. Additionally, it improves the `CategoryCard` to display the parent category name if the category is a subcategory.

## Goals and Success Metrics

- Search inputs are removed from the global headers.
- Search inputs are integrated at the page level for Categories and Brands, updating URL search params dynamically.
- `CategoryCard` visually displays the name of its parent category.

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

- [x] What was tested manually
- [x] Data verified in DB (show query + result)
- [x] Errors encountered and fixed
- [x] User confirmation received

## Execution Brief

- **Phase 1: Component Updates & Filter Creation**
  - **What happens:** Remove search inputs from headers, create `CategoryFilters` & `BrandFilters`. Update `page.tsx` to handle filtering and pass full category list for parent lookup.
  - **Test:** Open Category and Brand pages, verify headers don't have search bars, verify new search bars appear above grids, type in search bars to see URL update and list filter.
  - **Verify:** Ensure `CategoryCard` shows parent name correctly.
  - **Done when:** The user visually confirms the UI changes and filter functionality.
  - **Expected Outcome:**
    - Search bars move from headers to page-level filters.
    - Category cards display parent categories.

## Acceptance Criteria

1. `CategoryHeader` and `BrandHeader` do not contain search inputs.
2. `/categories` and `/brands` pages have functioning search inputs that update the URL.
3. The grid lists are properly filtered based on the URL search param without requiring a page reload.
4. `CategoryCard` successfully displays the parent category name if one exists.

## Post-Phase Testing

Refer to `process/context/tests/all-tests.md`. All code must pass:

1. `bun run lint`
2. `bunx tsc -p tsconfig.json --noEmit`

## Implementation Checklist

- [x] Remove `<Search>` and `<Input>` elements from `apps/admin/src/features/categories/components/category-header.tsx`.
- [x] Remove `<Search>` and `<Input>` elements from `apps/admin/src/features/brands/components/brand-header.tsx`.
- [x] Create `apps/admin/src/features/categories/components/category-filters.tsx` (Client component matching `ProductFilters` layout but only with a search input).
- [x] Create `apps/admin/src/features/brands/components/brand-filters.tsx` (Client component matching `ProductFilters` layout but only with a search input).
- [x] Export the new filter components in their respective `index.ts` files.
- [x] Update `apps/admin/app/[locale]/(dashboard)/categories/page.tsx`: Read `searchParams`, filter `categories` based on the search term, render `<CategoryFilters />`, and pass `allCategories` (or a parent map) to `<CategoryGrid />`.
- [x] Update `apps/admin/app/[locale]/(dashboard)/brands/page.tsx`: Read `searchParams`, filter `brands` based on the search term, and render `<BrandFilters />`.
- [x] Update `CategoryGrid` to accept `allCategories` and pass the `parentName` down to `CategoryCard`.
- [x] Update `CategoryCard` to accept and display `parentName` (e.g. using a badge or subdued text next to the category name).category name).

## Touchpoints

- `apps/admin/src/features/categories/components/category-header.tsx`
- `apps/admin/src/features/brands/components/brand-header.tsx`
- `apps/admin/src/features/categories/components/category-filters.tsx` (NEW)
- `apps/admin/src/features/brands/components/brand-filters.tsx` (NEW)
- `apps/admin/src/features/categories/components/index.ts`
- `apps/admin/src/features/brands/components/index.ts`
- `apps/admin/app/[locale]/(dashboard)/categories/page.tsx`
- `apps/admin/app/[locale]/(dashboard)/brands/page.tsx`
- `apps/admin/src/features/categories/components/category-grid.tsx`
- `apps/admin/src/features/categories/components/category-card.tsx`

## Public Contracts

- `<CategoryGrid>` will require a new prop `allCategories: TCategory[]` (or equivalent lookup map).
- `<CategoryCard>` will require an optional prop `parentName?: string`.
- URL structure for `/categories` and `/brands` will now actively use `?search=` for filtering.

## Blast Radius

- Minimal. Only affects the Admin Dashboard's Category and Brand list views. Backend services (`category.service.ts`, `brand.service.ts`) remain unchanged as filtering is performed in the React Server Components.

## Verification Evidence

- [x] Manual test passed: Search filters correctly update list without page reloads (using router).
- [x] Manual test passed: Subcategories correctly display their parent category name.
- [x] Automated Test passed: `bun run lint` (0 errors)
- [x] Automated Test passed: `bunx tsc -p tsconfig.json --noEmit` (0 errors)

## Resume and Execution Handoff

The plan is fully specced and ready for implementation. The next step is to hand off to the `ag-execute-agent` to implement the checklists sequentially.

## Cursor + RIPER-5 Guidance

- Use Cursor Plan mode: import this checklist
- RIPER-5: RESEARCH → INNOVATE → PLAN, then request EXECUTE
- After each phase: STOP and verify before proceeding
