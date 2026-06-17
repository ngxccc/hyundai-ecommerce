# Storefront B2B Read-Only Profile Fields - Plan

**Date:** 17-06-26  
**Complexity:** Simple  
**Status:** ⏳ PLANNED

## Overview
Implement strict read-only restrictions on B2B corporate profile details (Company Name, Tax ID, Business Type, and Province) for users with dealer roles (`DEALER_APPROVER`, `DEALER_PURCHASER`) to prevent unauthorized corporate changes and maintain invoicing/legal consistency.

## Quick Links
- [Goals and Success Metrics](#goals-and-success-metrics)
- [Execution Brief](#execution-brief)
- [Acceptance Criteria](#acceptance-criteria)
- [Implementation Checklist](#implementation-checklist)

## Goals and Success Metrics
* **Goal**:
  - Restrict user updates on B2B legal fields once approved.
  - Disable input controls on the UI for B2B profile sections.
  - Defensively filter B2B fields from the server-side update payload if the user is a dealer.
* **Success Metrics**:
  - Profile page displays corporate details but disables editing.
  - Attempting to submit altered B2B fields to the server action only updates the allowed personal fields (name, phone) and ignores the rest.
  - Clean typechecks and test suite executions.

---

## Execution Brief
This is a SIMPLE, single-session plan. Implement the phases continuously.

### Phase 1: UI Inputs Protection
- **What happens**: Disable `companyName`, `taxId`, `businessType`, and `province` inputs on the profile form component.
- **Verification**: UI inputs are visually and functionally disabled.

### Phase 2: Server Action Filtration
- **What happens**: Filter out B2B field updates from the `userService.update` payload in the server action if the session user is a dealer.
- **Verification**: Database updates only modify allowed fields.

### Phase 3: Post-Implementation Verification
- **What happens**: Run type checks and existing unit/integration tests.
- **Verification**: Clean typechecks and tests.

---

## Scope
* **In-Scope**:
  - Disabling corporate form controls in `profile-form.tsx`.
  - Adding role checking and sanitization in `profile.action.ts`.
* **Out-of-Scope**:
  - Altering the database schema or changing how administrators edit user accounts.

---

## Acceptance Criteria
1. ✅ `companyName`, `taxId`, `businessType`, and `province` inputs are disabled on the UI.
2. ✅ Server Action only updates B2B fields if the user is not a dealer (defensive retail/default paths).
3. ✅ Monorepo TypeScript check (`bun run check-types`) passes.
4. ✅ Test suites (`bun run test`) pass.

---

## Implementation Checklist

### Phase 1: UI Inputs Protection
1. [ ] Edit `apps/storefront/src/features/portal/components/profile-form.tsx` to set `disabled={true}` on the following fields:
   - `companyName` input
   - `taxId` input
   - `businessType` Select component
   - `province` input

### Phase 2: Server Action Filtration
2. [ ] Edit `apps/storefront/src/features/portal/actions/profile.action.ts` to check if `session.user.role === "DEALER_APPROVER" || session.user.role === "DEALER_PURCHASER"`.
3. [ ] If the check passes, only supply `name` and `phone` to `userService.update`, ignoring `companyName`, `taxId`, `businessType`, and `province`.

### Phase 3: Post-Implementation Testing
4. [ ] Run type check: `bun run check-types`.
5. [ ] Run tests: `bun run test`.
