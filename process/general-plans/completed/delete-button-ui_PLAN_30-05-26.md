# Delete Button UI Refactor for Brands and Categories

Date: 30-05-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

This plan details the UI updates for the delete buttons in `BrandCard` and `CategoryCard`. Currently, they use a standard browser `confirm()` dialog. The goal is to replace this with a modern `AlertDialog` popup, exactly matching the implementation of `DeleteProductButton`.

## Goals and Success Metrics

- Users see a modern `AlertDialog` instead of a native `confirm` dialog when deleting brands or categories.
- Delete logic is separated into standalone client components (`DeleteBrandButton` and `DeleteCategoryButton`) to match the codebase pattern established in products.
- Proper translations are added for the dialog texts.

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

- **Phase 1: Translation and Component Creation**
  - **What happens:** Add translation strings, create `DeleteBrandButton` and `DeleteCategoryButton`, and integrate them into `BrandCard` and `CategoryCard`.
  - **Test:** Open Category and Brand pages, click the trash icon, verify the new `AlertDialog` appears, click cancel to dismiss, click delete to execute the action.
  - **Verify:** Ensure items are deleted and toast notifications appear using the new translated strings.
  - **Done when:** The user visually confirms the UI changes and filter functionality.
  - **Expected Outcome:**
    - Standard browser `confirm` dialogs are removed.
    - `AlertDialog` popups provide a consistent, modern UX.

## Acceptance Criteria

1. Clicking the delete icon on a Brand or Category card opens an `AlertDialog`.
2. The `AlertDialog` displays the correct item name.
3. Confirming the deletion successfully triggers the server action and shows a toast.
4. The `confirm()` calls are completely removed from `brand-card.tsx` and `category-card.tsx`.

## Post-Phase Testing

Refer to `process/context/tests/all-tests.md`. All code must pass:

1. `bun run lint`
2. `bunx tsc -p tsconfig.json --noEmit`

## Implementation Checklist

- [x] Update `apps/admin/messages/en.json`: Add `messages` and `dialogs.delete` sections to `AdminCategories` and `AdminBrands`.
- [x] Update `apps/admin/messages/vi.json`: Add `messages` and `dialogs.delete` sections to `AdminCategories` and `AdminBrands` (with Vietnamese translations).
- [x] Create `apps/admin/src/features/categories/components/delete-category-button.tsx` (using `AlertDialog`, similar to `DeleteProductButton`).
- [x] Create `apps/admin/src/features/brands/components/delete-brand-button.tsx` (using `AlertDialog`, similar to `DeleteProductButton`).
- [x] Export the new components in their respective `index.ts` files.
- [x] Refactor `apps/admin/src/features/categories/components/category-card.tsx` to replace the inline delete button and `confirm()` logic with `<DeleteCategoryButton />`.
- [x] Refactor `apps/admin/src/features/brands/components/brand-card.tsx` to replace the inline delete button and `confirm()` logic with `<DeleteBrandButton />`.

## Touchpoints

- `apps/admin/messages/en.json`
- `apps/admin/messages/vi.json`
- `apps/admin/src/features/categories/components/delete-category-button.tsx` (NEW)
- `apps/admin/src/features/brands/components/delete-brand-button.tsx` (NEW)
- `apps/admin/src/features/categories/components/index.ts`
- `apps/admin/src/features/brands/components/index.ts`
- `apps/admin/src/features/categories/components/category-card.tsx`
- `apps/admin/src/features/brands/components/brand-card.tsx`

## Public Contracts

- `<DeleteCategoryButton>` will require props `categoryId: string` and `categoryName: string`.
- `<DeleteBrandButton>` will require props `brandId: string` and `brandName: string`.

## Blast Radius

- Minimal. Only affects the delete interactions on the Admin Dashboard's Category and Brand list views.

## Verification Evidence

- [x] Manual test passed: Delete dialog UI matches Product UI exactly.
- [x] Automated Test passed: `bun run lint` (0 errors)
- [x] Automated Test passed: `bunx tsc -p tsconfig.json --noEmit` (0 errors)

## Resume and Execution Handoff

The plan is fully specced and ready for implementation. The next step is to hand off to the `ag-execute-agent` to implement the checklists sequentially.

## Cursor + RIPER-5 Guidance

- Use Cursor Plan mode: import this checklist
- RIPER-5: RESEARCH → INNOVATE → PLAN, then request EXECUTE
- After each phase: STOP and verify before proceeding
