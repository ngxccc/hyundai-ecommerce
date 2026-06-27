# Phase Plan: Customer Portal & Settings UI (Storefront)

**Date**: 17-06-26
**Complexity**: COMPLEX (Multi-phase)
**Implementation Approach**: Next.js Server Components & Server Actions with 'use cache' Caching
**Execution Model**: Phase-by-Phase with Pre-Research and Post-Testing
**Status**: ✅ VERIFIED

---

## Overview

Implement the customer dashboard portal (`/portal/*`) in the storefront application, enabling users to view their account information, corporate B2B details, change their passwords, and manage multiple shipping addresses via a database-backed address book (`user_address` table). Additionally, integrate the address book directly into the checkout flow with a quick-select auto-fill modal, and optimize query latency using Next.js 16 `'use cache'` and invalidation in Server Actions.

This plan conforms to the guidelines in `process/features/storefront/references/2026-06-17-customer-portal-and-settings-design.md`, standard testing procedures in `process/context/tests/all-tests.md`, and routing instructions in `process/context/all-context.md`.

---

## 1. Context and Goals

Engage B2B/B2C users on the storefront by giving them control over their profiles, security, and addresses.

**In-scope**:

- Sidebar layout `/portal/layout.tsx` with BetterAuth protection.
- `/portal/profile` page: Personal profile & Corporate B2B detail form.
- `/portal/password` page: Password reset form.
- `/portal/addresses` page: Interactive address card grid with Add/Edit/Delete modals.
- `/portal/orders` page: Customer order history table & detail view.
- `/portal/debt` page: B2B debt repayment form & payment link generation.
- `/checkout` integration: Auto-fill modal selecting from address book.
- Next.js 16 `'use cache'` at database services layer.
- Server Actions for all writes with `revalidateTag` cache busting.
- Login redirection: redirect to homepage `/` on success by default.

**Out-of-scope**:

- Admin panel integration for managing address book (already in admin customer profile).
- Integration with third-party map APIs for geo-location lookup.

---

## 1.5 Execution Brief

### Phase 1: Database Schema & Services Setup

- **What happens**: Create the `debt_repayment` schema table, compile migrations, write the address book service methods in the database package, and configure Next.js 16 `'use cache'` tags.
- **Verification**: Database migration runs clean. Address service unit tests cover CRUD & default setting.

### Phase 2: Router Layout & Route Guards

- **What happens**: Build the storefront `/portal/layout.tsx` with sidebar navigation. Secure it using BetterAuth session check. Update login success default redirection to home `/`.
- **Verification**: Unauthenticated requests to `/portal/*` redirect to login. Login redirects to home `/` by default.

### Phase 3: Profile & Security UI

- **What happens**: Build the profile page `/portal/profile` (personal & B2B details) and password change page `/portal/password`. Write Server Actions with Zod validators.
- **Verification**: Profile edits and password changes submit correctly, validate inputs, and revalidate cache.

### Phase 4: Address Book UI

- **What happens**: Build the `/portal/addresses` page with card grid, create/edit modal sheets, and actions to set default or delete.
- **Verification**: Full CRUD lifecycle of user addresses functions correctly. Only one address holds `isDefault = true` at a time.

### Phase 5: Checkout & Repayment Integration

- **What happens**: Build the "/Select from Address Book" modal on the checkout page, and build the `/portal/debt` repayment page.
- **Verification**: Clicking an address in the modal auto-fills checkout. Repayment submits a pending transaction and redirects to PayOS.

---

## 1.75 Phased Execution Workflow

Each step must follow the RIPER-5 workflow pattern: pre-phase research, detailed planning, execution, local test verification, and phase approval.

---

## 2. Non-Goals and Constraints

- Mobile viewport minimum width: 375px.
- Pure Service Architecture: Route handlers and Server Actions must delegate database queries to `@nhatnang/database/services`.
- Security: Enforce user ID checking (`session.user.id === target.userId`) on all reads and writes.

---

## Design Specification

This plan integrates directly with the design spec: `process/features/storefront/references/2026-06-17-customer-portal-and-settings-design.md`.

---

## Phase Completion Rules

- Database migrations run successfully, migrating old `admin` users to `super_admin` and introducing new schemas (including `payment`, `payment_transaction`, and `debt_repayment` tables) without data loss.
- Next.js route middleware and server-side `assertRole` helper restrict access to authorized roles.
- B2B Trade Credit checkout executes inside a fast transaction using pessimistic locking (`SELECT FOR UPDATE NOWAIT`) with server-side price recalculation.
- PayOS dynamic link creation, raw body signature checking, and duplicate webhook delivery handling are verified end-to-end.
- Storefront checkout pages, polling views, re-verify cooldowns, B2B debt repayment dashboard, and the "Request Cancellation" flow are fully functional.
- Real-time and offline alerts (Zalo ZNS, Telegram bot alerts, outbox events, and escalation worker) are validated.
- All unit and E2E test suites pass successfully.

---

## Acceptance Criteria

- **Role Management**: Database role field holds refactored enum values. `proxy.ts` and Server Actions enforce strict RBAC.
- **PayOS Checkout**: Customers can check out using VietQR. The system creates dynamic payment links via PayOS, polls for status up to 10 minutes, and supports active re-verification.
- **PayOS Webhook**: Webhook endpoint verifies HMAC-SHA256 signatures using raw request bytes, processes duplicate deliveries gracefully, and writes async tasks (email, invoice) to the `outbox_event` table.
- **B2B Trade Credit**: Pre-approved dealers can checkout using Net Terms, deducting from their credit limit under a pessimistic lock. If locked, immediately fails fast with HTTP 429/409.
- **Sub-role Approval**: `dealer_purchaser` checkout requests are routed to `dealer_approver` for release.
- **Order Cancellation**: Self-cancellation of Trade Credit orders is restricted to `pending` status. Processing orders request cancellation and log high-priority alerts.
- **B2B Debt Repayment**: Dealers can view outstanding debt, and repay a custom amount via PayOS or Cash, clearing their overdue locks instantly.
- **Notifications**: Online users receive instant WebSocket updates. Offline users receive Zalo ZNS / SMS. Unattended alerts escalate at 2h, 12h, and 24h via Telegram and email.

---

## Implementation Checklist

### Step 1: Database Schema & Address Service

- [x] Create `debt_repayment` table schema in `packages/database/src/schemas/payment.schema.ts` (or `payment-transaction.schema.ts` / individual file).
- [x] Run `bun run db:generate` to generate the migration file.
- [x] Run `bun run db:migrate` and `bun run db:migrate:test` to update local databases.
- [x] Create `address.service.ts` in `packages/database/src/services/address/address.service.ts` containing:
  - `getByUserId(userId: string): Promise<TUserAddress[]>` (wrapped in `'use cache'` with tag `addresses-${userId}`)
  - `create(address: TNewUserAddress): Promise<TUserAddress>`
  - `update(id: string, userId: string, address: Partial<TNewUserAddress>): Promise<TUserAddress>`
  - `delete(id: string, userId: string): Promise<boolean>`
  - `setDefault(id: string, userId: string): Promise<void>` (performs atomic update transaction)
- [x] Expose `addressService` in `packages/database/src/services/interfaces.ts` and `registry.ts`.
- [x] Write unit tests for `addressService` in `packages/database/src/services/address/address.service.test.ts`. Verify unit tests pass via `bun test`.

### Step 2: Route Guard, Layout & Redirection

- [x] Create `apps/storefront/app/[locale]/(shop)/portal/layout.tsx`:
  - Enforce BetterAuth server-side session check. Redirect to `/login?callbackUrl=...` if not authenticated.
  - Implement mobile-responsive double column grid: Sidebar on the left, `{children}` on the right.
  - Add drawer drawer toggle (Hamburger menu) for mobile navigation.
- [x] Update `apps/storefront/src/features/auth/components/login-form.tsx`:
  - Change default successful login redirect target to `/` (home page).
- [x] Implement side-menu navigation links mapping to profile, password, addresses, orders, and debt repayment.

### Step 3: Profile & Password settings (UI & Actions)

- [x] Create `apps/storefront/src/features/portal/actions/profile.action.ts`:
  - `updateProfileAction`: Validates input using `updateProfileSchema`, calls `userService.update`, and triggers `revalidateTag("user-" + userId)`.
- [x] Create `apps/storefront/src/features/portal/actions/password.action.ts`:
  - `changePasswordAction`: Handles BetterAuth server-side password updates.
- [x] Create Profile Page `apps/storefront/app/[locale]/(shop)/portal/profile/page.tsx`:
  - Personal details form (name, phone, readonly email).
  - Business details form section if role is `dealer_approver` or `dealer_purchaser`.
- [x] Create Change Password Page `apps/storefront/app/[locale]/(shop)/portal/password/page.tsx`:
  - Fields: current password, new password, confirm new password.
  - Submits via `changePasswordAction`.

### Step 4: Address Book Management

- [x] Create Address Validation Schema `packages/database/validators/address.validators.ts`.
- [x] Create Address Server Actions in `apps/storefront/src/features/portal/actions/address.action.ts`:
  - `addAddressAction`
  - `updateAddressAction`
  - `deleteAddressAction`
  - `setDefaultAddressAction`
  - All write actions must execute `revalidateTag("addresses-" + userId)`.
- [x] Create Address Page `apps/storefront/app/[locale]/(shop)/portal/addresses/page.tsx`:
  - Grid list of saved addresses.
  - "Add Address" modal sheet containing recipient details, street address, district, province/city, default toggle.
  - Edit and Delete buttons on each address card.

### Step 5: Checkout Address Modal & Repayment Integration

- [x] Create "Select Address" Modal component in `apps/storefront/src/features/checkout/components/select-address-modal.tsx`.
- [x] Update `apps/storefront/app/[locale]/(shop)/checkout/page.tsx` (or target file if nested):
  - Add "Select from Address Book" button next to shipping address.
  - Open modal on click, fetch addresses client-side or pass via server component, auto-fill form on selection.
- [x] Create Repayment Server Action `apps/storefront/src/features/portal/actions/repayment.action.ts`:
  - `generateRepaymentLinkAction`: creates a pending row in `debt_repayment` and calls PayOS to get repayment checkout URL.
- [x] Create Debt Repayment Page `apps/storefront/app/[locale]/(shop)/portal/debt/page.tsx`:
  - Show available credit limit and current outstanding debt.
  - Repayment amount input field.
  - Select PAYOS (VietQR link) or CASH (instruction view).

---

## Touchpoints

- `packages/database/src/schemas/payment.schema.ts`
- `packages/database/src/services/interfaces.ts`
- `packages/database/src/services/registry.ts`
- `packages/database/src/services/address/address.service.ts`
- `apps/storefront/src/features/auth/components/login-form.tsx`
- `apps/storefront/app/[locale]/(shop)/portal/layout.tsx`
- `apps/storefront/app/[locale]/(shop)/portal/profile/page.tsx`
- `apps/storefront/app/[locale]/(shop)/portal/password/page.tsx`
- `apps/storefront/app/[locale]/(shop)/portal/addresses/page.tsx`
- `apps/storefront/app/[locale]/(shop)/portal/debt/page.tsx`

---

## Public Contracts

- `/portal` (Redirects to `/portal/profile`)
- `/api/payments/generate-repayment-link` (Generate repayment PayOS link)

---

## Blast Radius

- **Moderate impact**: Checkout page form (incorporates select address book button).
- **Moderate impact**: Login redirection default target (changed from `/dashboard` to `/`).
- **Low impact**: No database tables are deleted, only the new table `debt_repayment` is introduced.

---

## Verification Evidence

- Run typechecks: `tsc --noEmit` across all workspace projects.
- Run DB generate: `bun run db:generate` to verify schema validity.
- Run address service tests: `bun test packages/database/src/services/address/address.service.test.ts`.
- Verify auth layout guard by attempting unauthorized access to `/portal/profile` in a local browser session.
- Verify checkout auto-fill logic.

---

## Resume and Execution Handoff

When resuming or handing off to the next agent:

- Phase 1 (Database) must be completed before implementing Phase 2 (Router layout) and Phase 3/4.
- Cache tags `addresses-${userId}` and `user-${id}` must be cleared using `revalidateTag` inside write Server Actions.
- Refer to the detailed `check-list` items and mark progress incrementally.
