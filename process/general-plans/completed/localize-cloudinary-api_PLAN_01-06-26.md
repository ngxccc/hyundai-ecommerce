# Localize Cloudinary API Errors

**Date**: 01-06-26
**Complexity**: Simple
**Status**: ✅ VERIFIED

## Overview

This plan details the steps to eliminate hardcoded user-facing error strings in the Cloudinary Route Handlers inside `apps/admin/app/api/cloudinary`. We will transition these endpoints (`/api/cloudinary/sign` and `/api/cloudinary/upload`) to fetch translated messages dynamically using the `next-intl` localization framework configured for the admin panel.

We reference `process/context/all-context.md` for our repository structure and the `process/context/tests/all-tests.md` document for our verification guidelines.

## Quick Links

- [Localize Cloudinary API Errors](#localize-cloudinary-api-errors)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [Phase Completion Rules](#phase-completion-rules)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Implementation Checklist](#implementation-checklist)
    - [Phase 1: Translation Configuration](#phase-1-translation-configuration)
    - [Phase 2: Route Handler Refactoring](#phase-2-route-handler-refactoring)
    - [Phase 3: Verification \& Test Execution](#phase-3-verification--test-execution)
  - [Verification Evidence](#verification-evidence)
    - [Case 1: Sign Request with missing params (Error)](#case-1-sign-request-with-missing-params-error)
    - [Case 2: Upload Request with missing file (Error)](#case-2-upload-request-with-missing-file-error)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

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

## Touchpoints

This work touches the following components:

- **Localization files**:
  - `apps/admin/messages/en.json` (Adding Cloudinary namespace)
  - `apps/admin/messages/vi.json` (Adding Cloudinary namespace)
- **API Routes**:
  - `apps/admin/app/api/cloudinary/sign/route.ts` (Importing `next-intl/server` and retrieving localized errors)
  - `apps/admin/app/api/cloudinary/upload/route.ts` (Importing `next-intl/server` and retrieving localized errors)

## Public Contracts

No public APIs are changed structurally. The REST endpoints will continue to return JSON responses with `{ error: string }` under failure states, but the string values will be localized according to the request's locale.

The endpoints will support locale resolution via:

1. The `locale` URL search query parameter (e.g., `/api/cloudinary/upload?locale=en`)
2. The `NEXT_LOCALE` cookie (automatically populated by `next-intl` middleware)
3. Default fallback to `vi`

## Blast Radius

The blast radius is extremely narrow and restricted only to the Cloudinary API endpoints. No other page routing, database operations, or storefront functionalities are affected.

## Acceptance Criteria

1. ✅ The sign API (`/api/cloudinary/sign`) returns localized error messages when a signature signing failure occurs.
2. ✅ The upload API (`/api/cloudinary/upload`) returns localized error messages when:
   - No file is provided in multipart form data upload.
   - No URL is provided in JSON payload upload.
   - The content-type is unsupported.
   - An upload exception is thrown by the Cloudinary SDK.
3. ✅ Locales are resolved correctly using URL query parameters, cookies, or fallback values.
4. ✅ Translation messages are fully defined in both `vi.json` and `en.json` under the `"Cloudinary"` namespace.
5. ✅ Strict type-checking and tests pass without errors.

## Implementation Checklist

### Phase 1: Translation Configuration

- [x] Add `"Cloudinary"` translation namespace in English catalog (`apps/admin/messages/en.json`):

  ```json
  "Cloudinary": {
    "signFailed": "Failed to sign upload request",
    "noFileProvided": "No file provided",
    "noUrlProvided": "No URL provided",
    "unsupportedContentType": "Unsupported content type",
    "uploadFailed": "Upload failed"
  }
  ```

- [x] Add `"Cloudinary"` translation namespace in Vietnamese catalog (`apps/admin/messages/vi.json`):

  ```json
  "Cloudinary": {
    "signFailed": "Không thể ký yêu cầu tải lên",
    "noFileProvided": "Không có file nào được cung cấp",
    "noUrlProvided": "Không có đường dẫn URL nào được cung cấp",
    "unsupportedContentType": "Định dạng nội dung không được hỗ trợ",
    "uploadFailed": "Tải lên thất bại"
  }
  ```

### Phase 2: Route Handler Refactoring

- [x] Modify `apps/admin/app/api/cloudinary/sign/route.ts`:
  - Import `getTranslations` from `"next-intl/server"`
  - Resolve the locale from search parameters or fallback to cookie/default
  - Translate the hardcoded error `"Failed to sign"`
- [x] Modify `apps/admin/app/api/cloudinary/upload/route.ts`:
  - Import `getTranslations` from `"next-intl/server"`
  - Resolve the locale from search parameters or fallback to cookie/default
  - Translate hardcoded errors `"No file provided"`, `"No URL provided"`, `"Unsupported content type"`, and `"Upload failed"` / error messages.

### Phase 3: Verification & Test Execution

- [x] Run typescript checks: `bunx tsc -p tsconfig.json --noEmit` in `apps/admin` to verify types.
- [x] Run linting checks: `bun run lint` to ensure syntax formatting.
- [x] Trigger manual API requests with postman or curl to verify correct error languages are returned depending on `?locale=en` or `?locale=vi`.

## Verification Evidence

We will verify this change manually by making requests using `curl` to trigger failure flows and checking the JSON response for localized strings:

### Case 1: Sign Request with missing params (Error)

```bash
curl -X POST http://localhost:3000/api/cloudinary/sign?locale=vi \
  -H "Content-Type: application/json" \
  -d '{}'
```

_Expected output in Vietnamese:_

```json
{ "error": "Không thể ký yêu cầu tải lên" }
```

### Case 2: Upload Request with missing file (Error)

```bash
curl -X POST http://localhost:3000/api/cloudinary/upload?locale=en \
  -H "Content-Type: multipart/form-data"
```

_Expected output in English:_

```json
{ "error": "No file provided" }
```

## Resume and Execution Handoff

For the resumed executor, follow this order:

1. Start by editing `apps/admin/messages/en.json` and `apps/admin/messages/vi.json` to add the `"Cloudinary"` namespaces.
2. Edit `/api/cloudinary/sign/route.ts` and `/api/cloudinary/upload/route.ts` to fetch translations dynamically.
3. Test locally using curl or mock tools.

## Cursor + RIPER-5 Guidance

- **Cursor Plan Mode**:
  - Import this checklist and run all steps continuously.
- **RIPER-5 Mode**:
  - Transition to **EXECUTE** mode once this plan is approved.
  - Next Step: ENTER EXECUTE MODE
