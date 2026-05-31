# Error Handling Refactor (Services & Actions)

Date: 31-05-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

Refactor ALL `.service.ts` and `.action.ts` files across the repository that currently do not follow the standard error handling pattern used in `warehouse-stock.service.ts` and `warehouse.actions.ts`. Specifically, instead of services returning `{ success: false }` or custom result objects (like `TAuthActionResult`), they will throw structured errors upon failure. Conversely, actions will catch these errors using `try/catch` blocks.

See [process/context/all-context.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/all-context.md) for general context.
See [process/context/tests/all-tests.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/tests/all-tests.md) for post-phase testing details.

**Quick Links:**

- [Phase Completion Rules](#phase-completion-rules)
- [Goals and Success Metrics](#goals-and-success-metrics)
- [Execution Brief](#execution-brief)
- [Scope](#scope-inout)
- [Implementation Checklist](#implementation-checklist)

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

## Goals and Success Metrics

- **Goal:** Standardize error handling across all services and actions in the codebase.
- **Success Metrics:**
  - All `.service.ts` files throw descriptive errors on failure instead of returning objects.
  - All `.action.ts` files implement `try/catch` logic and handle the caught errors consistently.
  - All tests strictly adhere to `all-tests.md` rules (`bun run test`, `bun run lint`, `bunx tsc -p tsconfig.json --noEmit`).

## Execution Brief

- **Phase 1: Audit and Refactor Services**
  - What happens: Audit all `.service.ts` files (e.g., `auth.service.ts`, `category.service.ts`, etc.) and their interfaces. Remove failure return objects and replace them with `throw new Error(...)`.
  - Test: Run TypeScript strict check `bunx tsc -p tsconfig.json --noEmit` and `bun run lint`.
  - Verify: Ensure all services use `throw new Error(...)` for failure cases.
  - Done when: Type errors appear in the action files (fixed in next phase).

- **Phase 2: Audit and Refactor Actions**
  - What happens: Audit all `.action.ts` files (e.g., `login.action.ts`, `register.action.ts`, `admin-login.action.ts`). Wrap the service calls in `try/catch` blocks and return appropriate fail states to the client. Ensure to integrate `next-intl` (i18n) for any new error messages added to the actions.
  - Test: Run `bun run test` and `bunx tsc -p tsconfig.json --noEmit`.
  - Verify: Check that the UI correctly receives and displays translated error messages.
  - Done when: Manual tests confirm that error handling works flawlessly with i18n support.

- **Phase 3: Update Tests & Post-Phase Testing**
  - What happens: Update `.test.ts` files to mock errors correctly and assert the new behavior.
  - Test Procedure: Must follow `all-tests.md` protocol:
    1. `bun run test`
    2. `bun run lint`
    3. `bunx tsc -p tsconfig.json --noEmit`
  - Verify: All automated tests pass, zero type errors.
  - Done when: CI/CD is green.

**Expected Outcome:**

- All actions use `try/catch` and integrate i18n where necessary.
- All services throw errors on failure.
- Strict type-checking passes.

## Scope (In/Out)

- **In:** All `.service.ts`, `.action.ts`, their `.test.ts` files across the repo, and any i18n locale files (e.g. `vi.json`, `en.json`) if new error keys are needed.
- **Out:** Other layers (e.g., UI components) unless strictly necessary for compatibility.

## Assumptions and Constraints

- The UI layer expects the `{ success: false, error: string, code?: string }` shape for action failures, with `error` containing a translated string.

## Functional Requirements

- Action logic must gracefully catch service errors and return localized or standard error messages via i18n.

## Non-Functional Requirements

- Maintain backward compatibility with the front-end components consuming the actions.

## Acceptance Criteria

- [x] All `.action.ts` catch failures and return `{ success: false, error: '...' }` using localized error messages.
- [x] Any new error messages are defined in i18n translation files.
- [x] All `.service.ts` throw standard errors instead of returning custom result objects.
- [x] Pass `bun run test` on all modified files.
- [x] Pass `bun run lint`.
- [x] Pass `bunx tsc -p tsconfig.json --noEmit`.

## Implementation Checklist

- [x] Audit and refactor `packages/database/src/services/*.service.ts` (e.g. auth, category)
- [x] Refactor `apps/storefront/src/features/**/*.action.ts`
- [x] Refactor `apps/admin/src/features/**/*.action.ts`
- [x] Add/Update new error messages in i18n translation files (`vi.json`, `en.json`) if needed
- [x] Update types in corresponding `.interface.ts` files
- [x] Update tests in corresponding `.test.ts` files
- [x] Clean up unused types (e.g. `TAuthActionResult`)
- [x] Post-Phase Testing: `bun run test`
- [x] Post-Phase Testing: `bun run lint`
- [x] Post-Phase Testing: `bunx tsc -p tsconfig.json --noEmit`

## Risks and Mitigations

- **Risk:** Existing UI components might break if the error response shape changes unexpectedly.
- **Mitigation:** Carefully mimic the exact `{ success: false, error: string, code?: string }` response that was previously generated by the action, or update the UI if necessary.

## Integration Notes

- This aligns all features with `warehouses` feature in terms of Server Action error handling patterns.

## Touchpoints

- `packages/database/src/services/*.service.ts`
- `apps/storefront/src/features/**/*.action.ts`
- `apps/admin/src/features/**/*.action.ts`

## Public Contracts

- Server Actions return signatures will adjust to `{ success: false, error: string }` instead of returning custom error objects directly from services.

## Blast Radius

- All action flows across admin and storefront.

## Verification Evidence

- [x] All unit tests pass (`bun run test`).
- [x] Linter passes (`bun run lint`).
- [x] Strict TS passes (`bunx tsc -p tsconfig.json --noEmit`).

## Resume and Execution Handoff

- Executor should start by altering the services, then fix the compiler errors bubbling up to the actions and tests.

## Cursor + RIPER-5 Guidance

- Use Cursor Plan mode: import this checklist
- RIPER-5: RESEARCH → INNOVATE → PLAN, then request EXECUTE
- Avoid code until EXECUTE; if scope expands mid-flight, pause and convert to COMPLEX
- **After each phase: STOP and verify before proceeding**
