# Phase Plan: B2B Checkout Flow & User Roles Refactor

**Date**: 2026-06-15
**Complexity**: Complex
**Status**: ⏳ PLANNED

---

## 1. Overview

Implement a high-performance B2B checkout payment flow integrating **PayOS VietQR** for automated payment matching (0% transaction fee) and **B2B Trade Credit (Net Terms)** with pessimistic locking. This phase also refactors user roles to support granular internal business personas (`super_admin`, `sales_representative`, `accountant`, `warehouse_manager`) and B2B dealer sub-roles (`dealer_approver`, `dealer_purchaser`), and introduces a robust real-time notification and offline alerting system with timed escalation.

This plan conforms to the guidelines in `process/features/storefront/references/2026-06-15-checkout-and-role-refactor-design.md` and standard testing procedures in `process/context/tests/all-tests.md`.

---

## 2. Phase Completion Rules

- Database migrations run successfully, migrating old `admin` users to `super_admin` and introducing new schemas without data loss.
- Next.js route middleware and server-side `assertRole` helper restrict access to authorized roles.
- B2B Trade Credit checkout executes inside a fast transaction using pessimistic locking (`SELECT FOR UPDATE NOWAIT`) with server-side price recalculation.
- PayOS dynamic link creation, raw body signature checking, and duplicate webhook delivery handling are verified end-to-end.
- Storefront checkout polling, re-verify cooldowns, and the "Request Cancellation" flow are fully functional.
- Real-time and offline alerts (Zalo ZNS, Telegram bot alerts, outbox events, and escalation worker) are validated.
- All unit and E2E test suites pass successfully.

---

## 3. Acceptance Criteria

- **Role Management**: Database role field holds refactored enum values. `proxy.ts` and Server Actions enforce strict RBAC.
- **PayOS Checkout**: Customers can check out using VietQR. The system creates dynamic payment links via PayOS, polls for status up to 10 minutes, and supports active re-verification.
- **PayOS Webhook**: Webhook endpoint verifies HMAC-SHA256 signatures using raw request bytes, processes duplicate deliveries gracefully, and writes async tasks (email, invoice) to the `outbox_event` table.
- **B2B Trade Credit**: Pre-approved dealers can checkout using Net Terms, deducting from their credit limit under a pessimistic lock. If locked, immediately fails fast with HTTP 429/409.
- **Sub-role Approval**: `dealer_purchaser` checkout requests are routed to `dealer_approver` for release.
- **Order Cancellation**: Self-cancellation of Trade Credit orders is restricted to `pending` status. Processing orders request cancellation and log high-priority alerts.
- **Notifications**: Online users receive instant WebSocket updates. Offline users receive Zalo ZNS / SMS. Unattended alerts escalate at 2h, 12h, and 24h via Telegram and email.

---

## 4. Implementation Checklist

### Step 1: Database Schema & Role Migration

- [x] Update `user_role` pgEnum in `packages/database/src/schemas/auth.schema.ts` to include: `super_admin`, `sales_representative`, `accountant`, `warehouse_manager`, `dealer_approver`, `dealer_purchaser`, `customer`.
- [x] Add `creditLimit` and `currentDebt` numeric fields to `user` schema.
- [x] Add `paymentMethod`, `paymentStatus`, and `approvalStatus` fields to `order` schema in `packages/database/src/schemas/order.schema.ts`.
- [x] Create `payment_transaction` table schema.
- [x] Create `credit_limit_history` table schema.
- [x] Run `bun run db:generate`
- [x] Write a SQL migration script to safely map legacy `admin` to `super_admin`, legacy `dealer` to `dealer_approver`, and legacy `customer` to `customer`.
- [x] Run migration using `bun run db:migrate` and `bun run db:migrate:test`.

### Step 2: Access Control & Server Action Authorization

- [x] Implement `assertRole` helper function in `apps/admin/src/shared/lib/action-auth.ts` using type-safe dynamic values.
- [x] Secure Next.js Admin middleware (`apps/admin/proxy.ts`) to only allow internal roles: `SUPER_ADMIN`, `SALES_REPRESENTATIVE`, `ACCOUNTANT`, `WAREHOUSE_MANAGER`.
- [x] Integrate `assertRole` inside all Server Actions that write/modify database records (e.g., updating customer tiers/credit limits in `customer.actions.ts`).
- [x] Enforce customer ownership check (`order.userId === session.user.id`) in storefront order fetch/cancellation APIs (Design specification established for Step 5).

### Step 3: PayOS Integration & Webhook Handler

- [ ] Configure PayOS SDK in the storefront application. Add credentials to Doppler.
- [ ] Implement checkout API endpoint to request PayOS checkout links (calculating prices server-side from database catalog).
- [ ] Create raw body parser utility to extract raw request bytes from Next.js route requests.
- [ ] Implement `/api/payments/payos-webhook` route using raw body parser and constant-time comparison (`crypto.timingSafeEqual`) to verify signatures.
- [ ] Wrap webhook database writes in a transaction: check duplicate `referenceCode`, update order status, write invoice/email events to the `outbox_event` table, and gracefully return `200 OK` on unique constraint violations.

### Step 4: B2B Trade Credit & Pessimistic Locking

- [ ] Implement checkout server action for B2B Trade Credit.
- [ ] Implement server-side order total recalculation from database catalog prices.
- [ ] Wrap checkout in a Drizzle `db.transaction()`: lock the user row using `.for("update", { noWait: true })`.
- [ ] Verify limit availability: `creditLimit - currentDebt >= recalculatedTotal`. If successful, increment `currentDebt` and write Net 30/60 invoice.
- [ ] Catch `NOWAIT` lock acquisition failure and return a clear HTTP 429/409 error message.

### Step 5: Storefront UI, Polling & Cancellation Flows

- [ ] Implement a 10-minute short-polling window on the checkout success screen.
- [ ] Implement the "Re-verify Payment" button with a client-side 30-second cooldown timer.
- [ ] Build the "Request Cancellation" workflow modal on the storefront customer portal for orders already in `processing` or `shipped` state.
- [ ] Implement B2B sub-role checkout flow: allow `dealer_purchaser` to submit order for approval, updating `approvalStatus` to `PENDING_APPROVAL`.

### Step 6: Real-Time & Offline Notification System

- [ ] Configure Pusher client & server instances for storefront/CRM real-time toasts.
- [ ] Extend `outbox_event` schema with new communication channels (`SEND_ZALO_ZNS`, `SEND_TELEGRAM_ALERT`).
- [ ] Set up Telegram Bot alerting engine and save chat IDs to Doppler.
- [ ] Implement the outbox event processor cron job (polling `PENDING` events, checking Redis user presence, and dispatching to WebSockets/Pusher if online, or Telegram/Zalo if offline).
- [ ] Implement timed escalation cron worker (escalating alerts to managers and executives at 2h, 12h, and 24h).

---

## 5. Touchpoints

- `packages/database/src/schemas/auth.schema.ts`
- `packages/database/src/schemas/order.schema.ts`
- `packages/database/src/services/auth/auth.service.ts`
- `apps/admin/proxy.ts`
- `apps/storefront/app/api/payments/payos-webhook/route.ts`
- `apps/storefront/src/features/checkout/actions.ts`
- `apps/storefront/src/features/cart/actions.ts`

---

## 6. Public Contracts

- `/api/payments/payos-webhook` (PayOS Webhook URL)
- `/api/payments/verify-status` (Short polling checkout verification endpoint)
- `assertRole(allowedRoles: UserRole[])` shared backend helper

---

## 7. Blast Radius

- **High impact**: Database schemas (`user` and `order` tables require migrations).
- **High impact**: Access control (role enum changes will affect all users, necessitating script execution).
- **Moderate impact**: Storefront checkouts and B2B pricing flows.
- **Zero impact**: Static product and categories routes.

---

## 8. Verification Evidence

- Run types validation: `tsc --noEmit` on the entire monorepo.
- Run Drizzle migration check: `bun run db:generate` and check generated SQL files.
- Run unit tests for pessimistic locking and limit calculation: `bun test packages/database/src/services/user/user.service.test.ts`.
- Simulate PayOS webhook signature verification using test vectors to assert timing-safe hash matching.
- Verify outbox email and bot notification queues on local developer channels.
