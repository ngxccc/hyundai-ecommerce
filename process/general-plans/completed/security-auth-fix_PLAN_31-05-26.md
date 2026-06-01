# Security & Access Control Fix Plan

Date: 31-05-26
Complexity: Complex
Status: ✅ VERIFIED

## Overview

A recent security audit revealed a critical **Broken Access Control** vulnerability in `apps/admin`. Currently, the application lacks proper authentication (AuthN) and authorization (AuthZ) checks on both its Routes and Server Actions. This means any user who knows the endpoint URLs can access admin pages or execute server actions to modify the database.

This plan details the implementation of security middleware and action-level checks to lock down the admin application.

## Goals and Success Metrics

- Ensure all routes in `apps/admin` (except public login pages, if any) require a valid authenticated session.
- Ensure all Server Actions verify user authentication and authorization (e.g., role-based access control) before executing database operations.
- Security holes are fully patched without breaking existing UI workflows.

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

- **Phase 1: Route Protection & Middleware**
  - **What happens:** Implement or update Next.js middleware in `apps/admin` to intercept incoming requests and redirect unauthenticated users to a login page.
  - **Test:** Attempt to access `/products`, `/categories`, or `/brands` without an active session. Verify redirection to the login page.

- **Phase 2: Server Action Authorization**
  - **What happens:** Wrap or inject auth checks into all Server Actions (`deleteProductAction`, `createCategoryAction`, etc.) using a reusable authorization utility.
  - **Test:** Attempt to execute a Server Action directly without a valid session token. Verify that the action is rejected with a `401` or `403` error.

## Acceptance Criteria

1. No unauthorized access to `apps/admin` pages.
2. No unauthorized execution of Server Actions.
3. Proper redirection flows for unauthenticated users.
4. Error states handled gracefully in the UI.

## Post-Phase Testing

Refer to `process/context/tests/all-tests.md`. All code must pass:

1. `bun run lint`
2. `bunx tsc -p tsconfig.json --noEmit`

## Implementation Checklist

- [x] Check existing authentication setup in `packages/database` or `apps/admin` (e.g., NextAuth, Lucia, or custom session tokens).
- [x] Implement/Update `middleware.ts` in `apps/admin` for route protection. (Found that `proxy.ts` already handles it correctly).
- [x] Create an `auth` utility/wrapper for Server Actions in `apps/admin`.
- [x] Apply the `auth` wrapper to `brand.actions.ts`, `category.actions.ts`, `product.actions.ts`, etc.
- [x] Verify frontend gracefully handles "Unauthorized" responses from Server Actions (e.g., showing a toast and redirecting).

## Touchpoints

- `apps/admin/middleware.ts` (NEW or MODIFY)
- `apps/admin/src/lib/auth.ts` (NEW or MODIFY)
- `apps/admin/src/features/brands/actions/brand.actions.ts`
- `apps/admin/src/features/categories/actions/category.actions.ts`
- `apps/admin/src/features/products/actions/product.actions.ts`
- `process/context/all-context.md`

## Public Contracts

- `middleware` protects all paths matching `/(dashboard)/*` or similar.
- `withAuth` (or similar utility) wraps Server Actions.

## Blast Radius

- High impact on `apps/admin`. Incorrect implementation could lock out legitimate administrators or cause infinite redirection loops.

## Verification Evidence

- [x] Middleware blocks unauthorized access.
- [x] Server actions reject unauthorized executions.
- [x] `bun run lint` passes.
- [x] `bunx tsc -p tsconfig.json --noEmit` passes.

## Resume and Execution Handoff

The plan is specced. The next step is for the user to approve this plan so the `vc-execute-agent` can begin implementation, starting with verifying the existing Auth stack and creating the middleware.

## Cursor + RIPER-5 Guidance

- Use Cursor Plan mode: import this checklist
- RIPER-5: RESEARCH → INNOVATE → PLAN, then request EXECUTE
- After each phase: STOP and verify before proceeding
