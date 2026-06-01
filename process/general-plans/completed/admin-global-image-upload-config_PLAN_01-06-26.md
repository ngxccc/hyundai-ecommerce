# Admin Global Image Upload Configuration

Date: 01-06-26
Complexity: Complex (single execution stream)
Status: ✅ VERIFIED

## Overview

This plan turns the current product-only image upload UI into a shared, config-driven admin image upload component that can be reused across Product, Brand, and Category forms. The new contract will allow each form to declare its own maximum image count, so Product can keep multi-image behavior while Brand and Category can be constrained to a single image without duplicating upload logic.

Reference context:

- `process/context/all-context.md`
- `process/context/tests/all-tests.md`
- Existing admin upload implementation in `apps/admin/src/features/products/components/form-sections/images-section.tsx`
- Existing brand/category image sections in `apps/admin/src/features/brands/components/images-section.tsx` and `apps/admin/src/features/categories/components/images-section.tsx`

## Quick Links

- [Admin Global Image Upload Configuration](#admin-global-image-upload-configuration)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [Context and Goals](#context-and-goals)
  - [Phase Completion Rules](#phase-completion-rules)
  - [Execution Brief](#execution-brief)
    - [Phase 1: Shared Image Upload Contract and Limits](#phase-1-shared-image-upload-contract-and-limits)
    - [Phase 2: Product Migration to the Shared Component](#phase-2-product-migration-to-the-shared-component)
    - [Phase 3: Brand and Category Single-Image Adoption](#phase-3-brand-and-category-single-image-adoption)
    - [Expected Outcome](#expected-outcome)
  - [Scope](#scope)
    - [In Scope](#in-scope)
    - [Out of Scope](#out-of-scope)
  - [Assumptions and Constraints](#assumptions-and-constraints)
  - [Functional Requirements](#functional-requirements)
  - [Non-Functional Requirements](#non-functional-requirements)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Implementation Checklist](#implementation-checklist)
  - [Risks and Mitigations](#risks-and-mitigations)
  - [Integration Notes](#integration-notes)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Verification Evidence](#verification-evidence)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## Context and Goals

Current state:

- Product has the richest image uploader, but it is still product-specific and carries its own upload state and UI behavior.
- Brand and Category each render simpler single-image inputs, which leads to duplicated upload UI and inconsistent behavior.
- Cloudinary upload helpers already exist in `apps/admin/src/shared/services/cloudinary.service.ts`, so the work is primarily about UI contract design and form integration, not reimplementing upload plumbing.

Goals:

- Extract the upload UI into a shared admin component.
- Make the component configurable by maximum image count.
- Reuse the same component in Product, Brand, and Category forms.
- Preserve product multi-image behavior.
- Enforce a one-image limit for Brand and Category.
- Keep form state and backend payloads aligned with the existing admin save flow.

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
- [x] Data verified in DB/state (show query + result)
- [x] Errors encountered and fixed
- [x] User confirmation received

## Execution Brief

### Phase 1: Shared Image Upload Contract and Limits

What happens:

- Extract the product image upload UI into a reusable shared admin component.
- Introduce a config contract centered on `maxImages`, with omitted/undefined meaning unlimited.
- Keep preview, remove, drag-and-drop, and URL entry behaviors inside the shared component so feature forms only supply data and limits.

Integration points:

- `apps/admin/src/shared/components/*` or another shared admin UI location.
- Existing Cloudinary upload helper in `apps/admin/src/shared/services/cloudinary.service.ts`.
- Existing translations used by Product, Brand, and Category forms.

Test:

- Add component/unit tests for limit enforcement, preview rendering, add/remove behavior, and the disabled state when the image cap is reached.
- Run `bun test src/` inside `apps/admin` for the touched component tests.

Verify:

- Shared component renders for both array-backed and single-item usage patterns.
- Limit logic blocks a second image when `maxImages = 1`.
- Unlimited mode still accepts multiple images for Product.

Done when:

- The shared component behaves correctly in isolation and can be wired into all three forms without form-specific upload logic leaking back in.

### Phase 2: Product Migration to the Shared Component

What happens:

- Replace the product-specific upload section with the shared component.
- Preserve current multi-image behavior, file acceptance, and Cloudinary URL handling.
- Keep the current product submit flow intact so the save action still receives the same final images payload.

Integration points:

- `apps/admin/src/features/products/components/form-sections/images-section.tsx`
- `apps/admin/src/features/products/components/product-form.tsx`
- Existing product action and validation flow.

Test:

- Create/edit a product with multiple images, including remove/reorder-style interactions if supported by the current UI.
- Verify save still works with existing Cloudinary URLs and newly uploaded files.
- Run the product component/action tests that cover the touched save flow.

Verify:

- Saved product records still contain the expected `images` array.
- Existing upload and delete behavior remains stable after the refactor.

Done when:

- Product behaves exactly as before from the user perspective, but is powered by the shared upload component.

### Phase 3: Brand and Category Single-Image Adoption

What happens:

- Swap Brand and Category forms onto the shared component using `maxImages = 1`.
- Add a thin adapter if needed so each form can keep its existing single-string field contract while the shared uploader manages array-like UI state internally.
- Show clear feedback when the user tries to add a second image without removing the first.

Integration points:

- `apps/admin/src/features/brands/components/images-section.tsx`
- `apps/admin/src/features/categories/components/images-section.tsx`
- `apps/admin/src/features/brands/components/brand-form.tsx`
- `apps/admin/src/features/categories/components/category-form.tsx`

Test:

- Create/edit a brand and a category with exactly one image.
- Confirm a second upload is blocked or requires first removing the current image.
- Run form-level tests and any shared component tests covering the single-image path.

Verify:

- Brand and Category save flows still persist a single image value correctly.
- The UI communicates the limit clearly and prevents accidental over-selection.

Done when:

- Brand and Category use the same shared uploader contract as Product, but with a one-image cap enforced by config.

### Expected Outcome

- One shared admin image upload component replaces the duplicated product, brand, and category upload UIs.
- Product can still upload multiple images.
- Brand and Category are constrained to one image each.
- The upload limit is configurable per form instead of being hardcoded per component.
- The implementation stays aligned with the existing Cloudinary service and admin save flow.

## Scope

### In Scope

- Extract a shared image upload component for admin forms.
- Add a `maxImages` config contract.
- Migrate Product to the shared component.
- Migrate Brand and Category to the shared component with a single-image limit.
- Keep existing Cloudinary upload and preview behavior.
- Add tests for shared component behavior and form integration.

### Out of Scope

- Database schema changes.
- Media library management.
- Queueing/background upload redesign.
- Storefront image rendering changes.

## Assumptions and Constraints

- The current Cloudinary service helper remains the upload backend.
- Product image state can continue to be represented as an array.
- Brand and Category can either keep a single-string field or use a small adapter layer around the shared component.
- Admin forms should remain localized and consistent with the existing translation keys.
- The shared component should avoid hardcoding product-specific labels so it can be reused cleanly.

## Functional Requirements

- The shared component must support multiple images when `maxImages` is not set.
- The shared component must reject or disable uploads once the configured maximum is reached.
- The shared component must support drag-and-drop, click-to-select, URL entry, previews, and removal.
- Product must still accept multiple images.
- Brand and Category must only allow one image each.
- User feedback must explain why additional uploads are blocked when the limit is reached.

## Non-Functional Requirements

- The refactor must not regress admin form submission behavior.
- The shared component should be easily readable and reusable across forms.
- Validation and limit messaging should remain accessible.

## Acceptance Criteria

- Product, Brand, and Category all render image upload UIs from one shared component.
- Product can still submit multiple images successfully.
- Brand and Category cannot exceed one image.
- The limit is enforced in UI before form submission.
- Existing Cloudinary uploads still work for new files and URLs.
- Save flows still persist the expected image payloads.
- The refactor does not require database schema changes.

## Implementation Checklist

- [x] Extract the product upload UI into a shared admin component and add tests for the shared contract.
- [x] Define the `maxImages` configuration API and document unlimited behavior.
- [x] Add limit-state handling and user-facing messaging for capped modes.
- [x] Wire Product to the shared component with unlimited multi-image behavior.
- [x] Add or update tests for Product save behavior after the refactor.
- [x] Wire Brand to the shared component with `maxImages = 1`.
- [x] Wire Category to the shared component with `maxImages = 1`.
- [x] Add adapter logic if Brand/Category keep single-string field storage.
- [x] Add tests for the one-image path and over-limit rejection.
- [x] Run `bun test src/` in `apps/admin` for the touched tests.
- [x] Run `bun run lint` in `apps/admin`.
- [x] Run `bunx tsc -p tsconfig.json --noEmit` in `apps/admin`.
- [x] Manually verify Product, Brand, and Category create/edit flows in the admin UI.

## Risks and Mitigations

- Risk: Brand and Category currently use simpler single-string fields, so a naive refactor could break their form contracts.
- Mitigation: Use a shared component plus a thin adapter instead of forcing all forms into the same raw state shape.
- Risk: Limit enforcement might only exist in UI and not in state transitions.
- Mitigation: Add unit coverage for over-limit interactions and disabled add behavior.
- Risk: Product behavior could regress during extraction.
- Mitigation: Keep Product as the first migration target and validate it before switching Brand/Category.

## Integration Notes

- Reuse `apps/admin/src/shared/services/cloudinary.service.ts` instead of adding a second upload path.
- Keep upload previews and removal logic inside the shared component so forms stay thin.
- Preserve existing translation namespaces where possible; only add new keys if the shared component needs its own generic labels.
- If needed, colocate tests with the new shared component and any updated form wrappers per repo testing conventions.

## Touchpoints

- `apps/admin/src/features/products/components/form-sections/images-section.tsx`
- `apps/admin/src/features/products/components/product-form.tsx`
- `apps/admin/src/features/brands/components/images-section.tsx`
- `apps/admin/src/features/brands/components/brand-form.tsx`
- `apps/admin/src/features/categories/components/images-section.tsx`
- `apps/admin/src/features/categories/components/category-form.tsx`
- `apps/admin/src/shared/services/cloudinary.service.ts`
- Proposed shared UI location under `apps/admin/src/shared/components/`

## Public Contracts

- New shared image upload props contract, centered on `maxImages` and a value/onChange pair.
- Product keeps an array-based image payload.
- Brand and Category keep their existing single-image domain contract or use a minimal adapter that preserves the same saved shape.
- No database schema contract changes are expected.

## Blast Radius

- Admin product, brand, and category create/edit forms.
- Shared admin component library.
- Admin-side translation keys and tests.

## Verification Evidence

- Screenshot of the shared uploader rendering in Product mode with multiple images.
- Screenshot of Brand and Category forms blocking a second image.
- Saved admin record evidence showing product image arrays and single-image brand/category values persisted correctly.
- Test output from `bun test src/`, `bun run lint`, and `bunx tsc -p tsconfig.json --noEmit` for the touched admin slice.

## Resume and Execution Handoff

Executor should start with the shared component extraction, because that creates the new contract that Product, Brand, and Category will all depend on.

Recommended execution order:

1. Build the shared image upload component and its `maxImages` contract.
2. Migrate Product and verify the existing multi-image path still works.
3. Migrate Brand and Category with `maxImages = 1` and confirm their single-image flows still save correctly.

## Cursor + RIPER-5 Guidance

- Cursor Plan mode: import this checklist and execute the three phases in order.
- RIPER-5: RESEARCH -> INNOVATE -> PLAN, then request EXECUTE for the approved plan.
- If the adapter work for Brand/Category turns out to require deeper form-model changes, pause and widen scope only after user confirmation.
- After each phase, stop and verify before moving to the next one.
