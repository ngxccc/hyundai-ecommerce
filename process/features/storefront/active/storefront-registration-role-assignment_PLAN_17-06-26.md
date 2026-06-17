# B2B Registration Role Assignment - Plan

**Date:** 17-06-26  
**Complexity:** Simple  
**Status:** ⏳ PLANNED

## Overview
Implement automatic user role mapping during storefront registration based on `businessType` to ensure B2B registrations default to `DEALER_APPROVER` and B2C retail registrations default to `CUSTOMER`.

## Quick Links
- [Goals and Success Metrics](#goals-and-success-metrics)
- [Execution Brief](#execution-brief)
- [Acceptance Criteria](#acceptance-criteria)
- [Implementation Checklist](#implementation-checklist)

## Goals and Success Metrics
* **Goal**:
  - Auto-assign `DEALER_APPROVER` role to any new registered B2B user (`businessType !== "END_USER"`).
  - Auto-assign `CUSTOMER` role to any B2C user (`businessType === "END_USER"`).
* **Success Metrics**:
  - TypeScript compiles with zero errors.
  - All database service and auth tests pass.

---

## Execution Brief
This is a SIMPLE, single-session plan. Implement the phases continuously.

### Phase 1: Service Layer Update
- **What happens**: Add role mapping and pass `role` to Better Auth's `signUpEmail` in `auth.service.ts`.
- **Verification**: Code compilation and verification of arguments.

### Phase 2: Post-Implementation Verification
- **What happens**: Run type checks and existing unit/integration tests.
- **Verification**: Clean typecheck and tests.

---

## Scope
* **In-Scope**:
  - Modifying `auth.service.ts` registration method.
* **Out-of-Scope**:
  - Changing authentication layout templates or UI inputs.

---

## Acceptance Criteria
1. ✅ Registration assigns `DEALER_APPROVER` for B2B types.
2. ✅ Registration assigns `CUSTOMER` for `END_USER` type.
3. ✅ Monorepo TypeScript check (`bun run check-types`) passes.
4. ✅ Test suites (`bun run test`) pass.

---

## Implementation Checklist

### Phase 1: Service Layer Update
1. [ ] Edit `packages/database/src/services/auth/auth.service.ts` to compute the role as:
   ```typescript
   const role = businessType === "END_USER" ? "CUSTOMER" : "DEALER_APPROVER";
   ```
2. [ ] Supply `role` inside the `body` block passed to `signUpEmail`.

### Phase 2: Post-Implementation Testing
3. [ ] Run type check: `bun run check-types`.
4. [ ] Run tests: `bun run test`.
