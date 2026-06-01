# Background Image Upload Architecture

Date: 01-06-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

Currently, image uploads happen sequentially during the product form submission. This forces the user to wait for all files and external URLs to be uploaded to Cloudinary before the product is saved, degrading the UX. This plan redesigns the architecture to process image uploads in the background (Optimistic UI / Deferred Background Execution) using Next.js `after()` or similar background primitives, allowing the user to continue working immediately after clicking "Save".

## Goals and Success Metrics

- **Non-blocking Save**: "Save Product" action completes in < 500ms regardless of the number of images.
- **Data Integrity**: Images eventually appear on the product without data loss.
- **Orphan Prevention**: Only images confirmed by "Save" are uploaded to Cloudinary (preserving the rule established in Phase 3).

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

## Execution Brief

- **Phase 1: Background Upload Action**: Refactor the server action (`createProductAction`/`updateProductAction`) to immediately save the product with placeholder/temporary image paths, then use `after()` (Next.js 15) to perform the Cloudinary uploads and update the product record in the background.
  - Test: Submit form with heavy files.
  - Verify: UI responds instantly, DB is updated later.
  - Done when: Form unblocks immediately.
- **Phase 2: Form Handoff**: Update `product-form.tsx` to hand off the `FormData` directly to the server action instead of awaiting Cloudinary uploads on the client.
  - Test: Network tab confirms UI doesn't wait for uploads.
  - Verify: Next.js router navigates immediately.
  - Done when: UX feels instant.
- **Expected Outcome**: Instant form submission with eventual image consistency.

## Scope (In/Out)

- **In**: Refactoring Next.js server actions and API routes for deferred image uploading.
- **Out**: Creating a complex queueing system (like Redis/RabbitMQ) – we will rely on native Next.js capabilities to keep it simple.

## Assumptions and Constraints

- The hosting environment supports Next.js background execution (`unstable_after` or `after()`).
- The UI can handle images missing momentarily on the product list.

## Functional Requirements

- Form submission must return success to the client before image uploads complete.
- Server must reliably upload images to Cloudinary.
- Server must update the product `images` array in the database once uploads are done.

## Non-Functional Requirements

- High responsiveness (submission < 500ms).

## Acceptance Criteria

- [x] User clicks "Save Product" with 5 large images.
- [x] UI shows success toast and redirects immediately.
- [x] Images are processed in the background and appear in the product details shortly after.

## Implementation Checklist

- [x] 1. Update `product.actions.ts` to accept `FormData` (including raw files/URLs).
- [x] 2. Implement background execution (`after()`) inside the server action to upload files to Cloudinary.
- [x] 3. Update the product record in the database after the background upload completes.
- [x] 4. Modify `product-form.tsx` to pass `FormData` directly to the server action.
- [x] 5. Write tests in `apps/admin/src/features/products/actions/product.actions.test.ts` to verify background logic.
- [x] 6. Run `bun test --filter admin` — all tests green.
- [x] 7. Run `bun run lint` and `bunx tsc -p tsconfig.json --noEmit` - no ts and type error
- [x] 8. Manually test uploading and rapid UI feedback.

## Risks and Mitigations

- **Risk**: Serverless function is killed before background upload finishes.
- **Mitigation**: Use Next.js 15 `after()` to ensure the task completes after response is sent.

## Integration Notes

- Touches `ProductForm`, `product.actions.ts`, and Cloudinary upload logic.

## Touchpoints

- `apps/admin/src/features/products/components/product-form.tsx`
- `apps/admin/src/features/products/actions/product.actions.ts`

## Public Contracts

- Server action payload type will change to accept `FormData` instead of parsed JSON with pre-uploaded URLs.

## Blast Radius

- Product creation/update flows in the Admin dashboard.

## Verification Evidence

- Next.js server logs showing the background task completing.
- UI recording showing instant save.

## Resume and Execution Handoff

- Start at updating the server action to accept `FormData` so it can handle files directly, allowing the client to unblock instantly.

## Cursor + RIPER-5 Guidance

- Use Cursor Plan mode: import this checklist
- RIPER-5: RESEARCH → INNOVATE → PLAN, then request EXECUTE
- After each phase: STOP and verify before proceeding

## References

- Context: [all-context.md](../../context/all-context.md)
- Testing: [all-tests.md](../../context/tests/all-tests.md)
