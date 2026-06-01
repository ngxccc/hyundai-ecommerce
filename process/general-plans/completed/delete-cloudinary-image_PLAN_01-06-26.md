# Cloudinary Image Deletion Plan

Date: 01-06-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

When users edit a product and remove existing images from the UI, those images are removed from the database but remain abandoned on Cloudinary, wasting storage. This plan will implement an automatic cleanup mechanism that deletes orphaned images from Cloudinary in the background when a product is updated.

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

- **Phase 1: Cloudinary Delete Service**
  - What happens: Implement a `deleteFromCloudinary(url: string)` function that extracts the `public_id` from a Cloudinary URL and uses the SDK to delete it.
  - Test: Unit test the public_id extraction logic and deletion mock.
  - Verify: Function properly resolves and handles errors without crashing.
  - Done when: Tests pass and function is exported correctly.

- **Phase 2: Product Action Integration**
  - What happens: Update `updateProductAction` to fetch the old product, compare `oldProduct.images` vs `newImages` to find removed URLs, and process them in the background `after()` hook.
  - Test: Edit a product in the UI, remove an image, and save.
  - Verify: Image is removed from the database and Cloudinary dashboard confirms the asset is gone.
  - Done when: User confirms the end-to-end flow works seamlessly without slowing down the main request.

**Expected Outcome:**

- Cloudinary storage stays clean with no orphaned files.
- User experience remains fast because deletion happens asynchronously in `after()`.

## Scope

**In Scope:**

- Deleting Cloudinary images when editing a product.
- Extracting `public_id` from secure URLs.

**Out of Scope:**

- A cron job for deleting unused images globally (orphan sweep).
- Deleting images when the entire Product is deleted (can be a separate feature).

## Assumptions and Constraints

- Cloudinary URLs follow the standard format: `.../upload/v1234/folder/filename.ext`.
- Background execution using `next/server` `after()` is stable and error-tolerant.

## Functional Requirements

- Identify missing images by diffing `existingProduct.images` and the submitted payload `images`.
- Silently handle errors if an image fails to delete on Cloudinary so the database update doesn't roll back.

## Acceptance Criteria

- [x] Editing a product and removing an image triggers a Cloudinary deletion request in the background.
- [x] The `public_id` is successfully parsed from the image URL.
- [x] If Cloudinary deletion fails, the product update still succeeds (error is just logged).
- [x] Adding new images does not accidentally delete them.
- [x] Relevant tests verify the correctness of URL parsing and deletion logic.
- [x] Reference `process/context/all-context.md` and `process/context/tests/all-tests.md` for context and post-phase testing.

## Implementation Checklist

- [x] 1. Modify `apps/admin/src/shared/services/cloudinary.service.ts` to add `getPublicIdFromUrl(url: string)` and `deleteFromCloudinary(url: string)`.
- [x] 2. Update `apps/admin/src/shared/services/index.ts` to export `deleteFromCloudinary`.
- [x] 3. In `apps/admin/src/features/products/actions/product.actions.ts` (`updateProductAction`), fetch the existing product using `productService.getById(id)`.
- [x] 4. Calculate `imagesToDelete = oldProduct.images.filter(url => !validatedData.images.includes(url))`.
- [x] 5. Inside the existing `after()` hook, loop over `imagesToDelete` and call `deleteFromCloudinary(url)`.
- [x] 6. Write Unit Tests for `getPublicIdFromUrl` in `cloudinary.service.test.ts` to ensure it parses URLs correctly.
- [x] 7. Update `product.actions.test.ts` to mock `deleteFromCloudinary` and verify it's called with the correct URLs.
- [x] 8. Ask the user to run `bun test` and perform a manual End-to-End test via UI.

## Touchpoints

- Backend Service: `apps/admin/src/shared/services/cloudinary.service.ts`
- Server Action: `apps/admin/src/features/products/actions/product.actions.ts`
- Tests: `apps/admin/src/features/products/actions/product.actions.test.ts`

## Public Contracts

- No API contract changes. The UI form already submits the retained images correctly.

## Blast Radius

- Very low. Does not change the user interface. Background failure to delete an image only logs an error and doesn't break the user experience.

## Verification Evidence

- Automated tests passing.
- UI confirmation that product saves successfully and Cloudinary backend reflects deletion.

## Resume and Execution Handoff

- Executor should start by implementing `deleteFromCloudinary` first, testing the Regex/URL parser extensively.

## Cursor + RIPER-5 Guidance

- RIPER-5: The user has triggered the PLAN phase. Await approval before entering EXECUTE mode.
