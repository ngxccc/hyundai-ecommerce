# Security Remediation and Rate Limiting Implementation - Plan

Date: 04-06-26
Complexity: Simple
Status: ⏳ PLANNED

## Overview

This plan details the steps to address security vulnerabilities and implement rate limiting across the `admin` and `storefront` applications. We will protect Cloudinary endpoints, enforce folder-based restrictions to prevent IDOR during media deletion, restrict image uploads to safe sizes/types, mitigate Server-Side Request Forgery (SSRF) risks, and introduce an in-memory rate-limiting mechanism for sensitive auth and media endpoints.

Following the project's architectural guidelines in `process/context/all-context.md`, all changes will preserve the pure service architecture, use typed server actions, and ensure user-facing error messages are localized through the application's translation dictionaries (`vi.json`, `en.json`) instead of being hardcoded.

## Touchpoints

The following files will be created or modified as part of this implementation:

- **New Files**:
  - `packages/shared/src/utils/rate-limiter.ts`: In-memory rate limiting utility.

- **Modified Files**:
  - `apps/admin/messages/vi.json` & `en.json`: Add translation keys for rate-limit and authorization errors.
  - `apps/storefront/messages/vi.json` & `en.json`: Add translation keys for rate-limit errors.
  - `apps/admin/app/api/cloudinary/upload/route.ts`: Enforce admin role check, upload size/MIME validation, rate limiting, and SSRF domain/IP mitigation.
  - `apps/admin/app/api/cloudinary/sign/route.ts`: Enforce admin role check and rate limiting.
  - `apps/admin/src/shared/services/cloudinary.service.ts`: Update `uploadToCloudinary` with file validation, and update `deleteFromCloudinary` to enforce expected folder checks.
  - `apps/admin/src/features/products/actions/product.actions.ts`: Pass expected folder `products` to `deleteFromCloudinary`.
  - `apps/admin/src/features/categories/actions/category.actions.ts`: Pass expected folder `categories` to `deleteFromCloudinary`.
  - `apps/storefront/src/features/auth/actions/login.action.ts`: Enforce rate limiting.
  - `apps/storefront/src/features/auth/actions/register.action.ts`: Enforce rate limiting.
  - `apps/admin/src/features/auth/actions/admin-login.action.ts`: Enforce rate limiting.

## Public Contracts

- **Rate Limiter Utility**:

  ```typescript
  export interface RateLimitConfig {
    limit: number;
    windowMs: number;
  }
  export function checkRateLimit(
    key: string,
    config: RateLimitConfig,
  ): {
    success: boolean;
    remaining: number;
    resetTime: number;
  };
  ```

- **Cloudinary Deletion Service**:

  ```typescript
  export const deleteFromCloudinary = async (url: string, expectedFolder?: string): Promise<boolean>;
  ```

## Blast Radius

- **Low Risk**: The introduction of rate-limiting is scoped to auth actions and media APIs.
- **Low Risk**: Cloudinary deletions are validated against specific folders (`products` or `categories`), preventing accidental or malicious media destruction outside these directories.
- **Verification Boundaries**: All unit tests in `packages/database` and apps must compile and run cleanly.

## Phase Completion Rules

Each phase is considered complete when:

1. Code compiles without TypeScript errors.
2. The specific verification step for the phase passes.
3. No regression in existing functionalities is introduced.

## Acceptance Criteria

- [ ] Rate limiting blocks clients exceeding limits on login, registration, and upload endpoints.
- [ ] Cloudinary upload and signing APIs verify that the user is authenticated and has the `admin` role.
- [ ] Cloudinary upload rejects files exceeding 5MB or files that are not images.
- [ ] SSRF mitigation prevents non-http(s) protocols and local/private loopback IP addresses from being proxy-uploaded.
- [ ] Direct call of `deleteFromCloudinary` with a mismatched folder prefix returns `false` and does not call Cloudinary API.
- [ ] No UI error strings are hardcoded; all error messages utilize `vi.json` and `en.json` keys.
- [ ] Linting, building, and tests pass successfully.

## Phased Delivery Plan

### Phase 1: Shared Rate Limiter & Translations

- **Task**: Create the in-memory rate-limiter utility in `@nhatnang/shared`.
- **Task**: Add translation keys for `"rateLimitExceeded"` and `"unauthorized"` in the language files.
- **Verification**: Run `bun run check-types` to ensure shared utility exports correctly.

### Phase 2: Cloudinary Upload, Sign & Service Remediation

- **Task**: Protect `/api/cloudinary/upload` and `/api/cloudinary/sign` routes with `getCachedSession` admin check.
- **Task**: Add MIME-type and size validation to file uploads.
- **Task**: Implement IP-based rate limiting on upload routes and SSRF safety check on URL upload.
- **Task**: Update `deleteFromCloudinary` in `cloudinary.service.ts` to require and validate folder prefixes.
- **Verification**: Verify that unauthorized requests to sign or upload return 401.

### Phase 3: Update Actions & Rate Limit Enforcement

- **Task**: Add rate-limiting checks using client IP to storefront login, storefront register, and admin login server actions.
- **Task**: Pass expected folders `products` and `categories` in product and category deletion actions.
- **Verification**: Execute all test suites and verify that the build compiles cleanly.

## Verification Evidence

1. **Unit and Integration Tests**:
   - Execute the test suite for Cloudinary service in `apps/admin/src/shared/services/cloudinary.service.test.ts`.
   - Ensure all database unit tests run successfully following guidelines in `process/context/tests/all-tests.md`.
2. **Security Checks Verification**:
   - Verify that uploading files larger than 5MB or non-image types returns 400 with a localized error key.
   - Verify that proxy upload of localhost/local network URLs in `/api/cloudinary/upload` is rejected.
   - Verify that the rate limiter successfully triggers when limit is exceeded.

## Resume and Execution Handoff

Upon plan approval:

1. Initialize the checklist tasks in the `todo` manager.
2. Enter the execution phase by invoking `vc-execute-agent`.

---

**Next Step**: Enter the execution phase with `ENTER EXECUTE MODE`.
