# B2B Registration Role Assignment Design Spec

* **Date**: 2026-06-17
* **Status**: Approved
* **Feature**: storefront/auth

## Background
Currently, when a user registers on the storefront application, their role defaults to `CUSTOMER` because no role parameter is supplied in the `signUpEmail` payload to Better Auth. For B2B registrations (Dealers, Contractors, and Distributors), this is incorrect. The first registration for a B2B corporate entity should receive the `DEALER_APPROVER` role so they can act as the main manager of corporate purchasing and credit limits, while regular retail users get `CUSTOMER`.

## Goals
1. Automatically determine the user role on registration based on the selected `businessType`.
2. Map `businessType === "END_USER"` to the `CUSTOMER` role.
3. Map B2B types (`DEALER`, `CONTRACTOR`, `DISTRIBUTOR`) to the `DEALER_APPROVER` role.

## Detailed Design
In `packages/database/src/services/auth/auth.service.ts`:
- Inside the `register` method, inspect the incoming `businessType` field from the registration data.
- Determine the role string dynamically:
  ```typescript
  const role = businessType === "END_USER" ? "CUSTOMER" : "DEALER_APPROVER";
  ```
- Supply `role` inside the `body` parameter passed to `this.betterAuth.api.signUpEmail`.

## Affected Files
* `packages/database/src/services/auth/auth.service.ts`

## Verification Plan
1. **TypeScript Compilation**: Run `bun run check-types` across the workspace.
2. **Unit Tests**: Run `bun run test` to verify there are no test failures or regressions.
