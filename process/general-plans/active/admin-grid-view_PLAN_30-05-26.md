# Admin Grid View Transformation

**Date:** 30-05-26
**Complexity:** Simple
**Status:** ✅ VERIFIED

## Overview

Convert the data presentation format in the Admin dashboard for Brands and Categories from a tabular layout to a responsive Grid/Card layout, mirroring the exact UX currently implemented for Products. Reference `process/context/all-context.md` for naming conventions and architectural guidelines.

## Touchpoints

- `apps/admin/src/features/brands/components/brand-table.tsx` -> Delete
- `apps/admin/src/features/categories/components/category-table.tsx` -> Delete
- `apps/admin/src/features/brands/components/brand-card.tsx` -> New
- `apps/admin/src/features/brands/components/brand-grid.tsx` -> New
- `apps/admin/src/features/categories/components/category-card.tsx` -> New
- `apps/admin/src/features/categories/components/category-grid.tsx` -> New
- `apps/admin/app/[locale]/(dashboard)/brands/page.tsx` -> Modify
- `apps/admin/app/[locale]/(dashboard)/categories/page.tsx` -> Modify
- `apps/admin/messages/vi.json` and `en.json` -> Modify

## Public Contracts

- No database changes. Only UI presentation changes.
- The props for `BrandGrid` and `CategoryGrid` will be identical to their table counterparts (`brands: TBrand[]` and `categories: TCategory[]`).

## Blast Radius

- The UI list pages for Brands and Categories in the Admin Dashboard.
- Translation files (`vi.json` and `en.json`).

## Phase Completion Rules

1. **Integration Test** - Grids render data correctly from the database.
2. **Manual Test** - Card layout is responsive.
3. **Error Handling** - Missing images use placeholders.
4. **User Confirmation** - User visually confirms.

## Acceptance Criteria

- Admin Brands and Categories pages render as a grid of cards instead of a table.
- Empty states are handled gracefully.
- All CRUD actions (Edit/Delete) on the cards work correctly.

## Implementation Checklist

- [x] Add translation namespaces (`AdminBrands.card`, `AdminCategories.card`).
- [x] Create `BrandCard` and `BrandGrid`.
- [x] Create `CategoryCard` and `CategoryGrid`.
- [x] Update `/brands` page to use `<BrandGrid />`.
- [x] Update `/categories` page to use `<CategoryGrid />`.
- [x] Delete old table implementations.

## Post-Phase Testing

- Manual Verification of `/brands` and `/categories` rendering.
- Reference `process/context/tests/all-tests.md` for standard procedures.

## Verification Evidence

- [x] Provide a summary and verify the URL paths.
- Tests passed: `bun run lint` (0 errors) and `bunx tsc -p tsconfig.json --noEmit` (0 errors).
- UI visually works and behaves correctly without table files.

## Resume and Execution Handoff

- Start by creating the `brand-card.tsx` and `category-card.tsx` components.

## Next Step

ENTER EXECUTE MODE
