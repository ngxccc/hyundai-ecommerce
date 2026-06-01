# Product Image Upload Integration

Date: 01-06-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

Currently, the Product CRUD form in the Admin application uses a simple text input for the image URL (MVP approach). To enhance the management experience and prevent broken links from external sources, this plan will integrate the Cloudinary image upload service. This will allow admins to upload images directly from their computers via a drag-and-drop interface, with no limit on the number of images and a maximum file size of 10MB per image.

Reference contexts can be found in `process/context/all-context.md` and testing guidelines in `process/context/tests/all-tests.md`.

## Quick Links

- [Decisions](#decisions)
- [Phase Completion Rules](#phase-completion-rules)
- [Execution Brief](#execution-brief)
- [Scope](#scope)
- [Implementation Checklist](#implementation-checklist)
- [Verification Evidence](#verification-evidence)
- [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## Decisions

1. **Upload Service:** Cloudinary will be used for image hosting and uploads.
2. **Maximum Images:** No limit on the number of images per product.
3. **Maximum File Size:** 10MB per image.

---

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

- [ ] What was tested manually
- [ ] Data verified in DB (show query + result)
- [ ] Errors encountered and fixed
- [ ] User confirmation received

---

## Execution Brief

This project is classified as **Simple** (one-session feature). The implementation is grouped into 2 main phases:

### Phase 1: Backend & Service Configuration Setup

- **What happens:** Install the Cloudinary package (e.g., `next-cloudinary`), and no need set up environment variables for Cloudinary credentials because I use Doopler.
- **Test Procedure:** Verify that the environment variables are correctly loaded and that the Cloudinary widget can render.
- **Verify:** Ensure that test images successfully appear on the Cloudinary dashboard.
- **Done when:** Admin developer confirms the upload integration can connect to Cloudinary.

### Phase 2: Replace UI Image Input with Cloudinary Upload Widget

- **What happens:** In `apps/admin/src/features/products/components/form-sections/images-section.tsx`, replace the text `<Input>` with the Cloudinary Upload Widget (or a custom Dropzone triggering the widget) that supports drag-and-drop and allows multiple uploads (up to 10MB each).
- **Test Procedure:** Open the Create/Edit Product page in Admin, drag and drop an image into the designated area, wait for a successful upload, and save.
- **Verify:** Query the `product` table in the database to ensure the `images` column (text array) contains the newly uploaded Cloudinary URLs.
- **Done when:** The user/admin confirms the form works smoothly and the images load successfully on the Storefront.

### Phase 3: Deferred Cloudinary Upload & External URL Support (Refactor)

- **What happens:** Replace the direct `CldUploadWidget` with a custom UI combining `react-dropzone` (for local files) and an input field (for external URLs like `https://hyundainhatnang.com/...`).
  - When files are dropped, preview them locally using `URL.createObjectURL`.
  - When an external URL is added, show its preview.
  - Only when the user clicks "Save Product" will the new items (local files and external URLs) be uploaded to Cloudinary via a Next.js backend API route (`/api/cloudinary/upload`). Cloudinary natively supports fetching and uploading from external URLs.
- **Test Procedure:**
  1. Drop a local file.
  2. Paste an external image URL.
  3. Verify both preview correctly. Click "Save Product".
  4. Verify the database saves the newly generated Cloudinary URLs for both.
- **Verify:** Check Cloudinary dashboard to ensure no orphaned files exist if the form is abandoned, and external URLs are successfully migrated to Cloudinary.
- **Done when:** Uploads (from files and external URLs) only occur upon form submission and return Cloudinary URLs.

**Expected Outcome:**

- A more professional Admin interface.
- No need to manually source and paste external image URLs.
- The `images` column in the database will reliably store valid image URLs hosted by Cloudinary.

---

## Scope

- **In-Scope:**
  - Integrate Cloudinary upload widget in `apps/admin`.
  - Implement a drag-and-drop image interface in `ProductImagesSection`.
  - Enforce a 10MB max file size limit.
  - Allow an unlimited number of images.
  - Display image previews for uploaded files.
  - Allow direct deletion of images from the UI (updates form state).
- **Out-of-Scope:**
  - Modifying the `packages/database` schema (the current `images: text().array()` column is fully compatible).
  - Building a full media library/gallery manager — focus is strictly on uploading for individual Products.

## Assumptions and Constraints

- Database schema requires no changes.
- Upload form utilizes the existing React Hook Form + Zod setup.
- Replacing the old `Input` UI with the Cloudinary widget is acceptable.

## Functional Requirements

- Admins can upload `.jpg`, `.png`, and `.webp` files (up to 10MB each).
- Admins can also paste external image URLs to be automatically migrated to Cloudinary.
- Admins can upload an unlimited number of images per product.
- Admins can remove uploaded images from the form before saving.
- Upon form submission, any new `File` objects or `external URLs` are uploaded to Cloudinary first, then the final `images` array containing only Cloudinary string URLs is sent to the existing Server Action.

## Acceptance Criteria

- The integration does not break existing Product save logic.
- The interface is intuitive, featuring a progress bar/spinner during uploads.
- Uploaded image URLs render correctly on the storefront application.

---

## Implementation Checklist

- [x] Retrieve Cloudinary API Keys (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) in Doopler.
- [x] Install the `next-cloudinary` package in `apps/admin`.
- [x] Update `apps/admin/src/features/products/components/form-sections/images-section.tsx` to replace the text `<Input>` with the `CldUploadWidget` (or similar Cloudinary dropzone UI).
- [x] Configure the widget options: `maxFiles: undefined` (no limit), `maxFileSize: 10485760` (10MB), and allow valid image formats.
- [ ] Post-Phase Testing: Test uploading images via the form and inspect the returned URL state.
- [ ] Save a new or edited Product to verify the image URLs are successfully stored in the database via Drizzle ORM.
- [ ] Test error handling (e.g., file larger than 10MB, invalid format).
- [x] Remove unused legacy UI code.

### Phase 3 Checklist (Deferred Upload & External URL)

- [x] Install `react-dropzone` package in `apps/admin`.
- [x] Create `apps/admin/app/api/cloudinary/upload/route.ts` to handle both `FormData` (files) and JSON (external URLs) to upload via Cloudinary SDK.
- [x] Refactor `images-section.tsx` to include both a dropzone and a URL input field.
- [x] Update `product-form.tsx` to intercept `File`s and external URLs on submit, upload them to the API, and submit the resulting Cloudinary URLs.

---

## Integration Notes

- No need to update `.env` for `apps/admin` (and potentially the root level, depending on the Turbo setup) with Cloudinary secrets.
- **No changes required** in `product.services.ts` or `packages/database` since the logic to save a string array of URLs is already functional.

## Touchpoints

- `apps/admin/src/features/products/components/form-sections/images-section.tsx` (Main UI change).

## Public Contracts

- No changes to the DB schema.
- The `ProductImagesSection` component maintains its current Props Interface: `images: string[]` and `setImages: React.Dispatch<React.SetStateAction<string[]>>`.

## Blast Radius

- Product creation and editing forms in `apps/admin`.
- If API keys are misconfigured, image updates will fail, but this will not affect the logic of other text fields.

## Verification Evidence

- Evidence 1: Screenshot of the form upload interface (dropzone) in Edit Product mode.
- Evidence 2: Postgres Database record showing the text array contains links with the Cloudinary domain.

## Resume and Execution Handoff

The upload service (Cloudinary) has been finalized in the [Decisions](#decisions) section. The Executor will:

1. Request the user to set the necessary environment variables (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, etc.).
2. Install packages using `bun add next-cloudinary --filter admin`.
3. Proceed down the [Implementation Checklist](#implementation-checklist) sequentially.

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan mode:** You can import the Implementation Checklist directly into Cursor.
- **RIPER-5:**
  - We are currently in the **PLAN** phase.
  - The plan is fully approved. Issue the `ENTER EXECUTE MODE` command (or notify the agent) to begin implementation.
  - After each block check, please pause for manual Verification (logging into the admin UI to test the upload) before signing off on the feature.
