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
- [x] Create `payment` table schema (obligation record: 1 row per order, always stores `totalAmount`).
- [x] Create `payment_transaction` table schema (event log: N rows per order; `referenceCode` becomes the webhook lookup key).
- [x] Remove `transactionId` column from `payment` table (webhook matching now uses `payment_transaction.referenceCode`).
- [x] Create `credit_limit_history` table schema.
- [x] Run `bun run db:generate`
- [x] Write a SQL migration script to safely map legacy `admin` to `super_admin`, legacy `dealer` to `dealer_approver`, and legacy `customer` to `customer`.
- [x] Run migration using `bun run db:migrate` and `bun run db:migrate:test`.

### Step 2: Access Control & Server Action Authorization

- [x] Implement `assertRole` helper function in `apps/admin/src/shared/lib/action-auth.ts` using type-safe dynamic values.
- [x] Secure Next.js Admin middleware (`apps/admin/proxy.ts`) to only allow internal roles: `SUPER_ADMIN`, `SALES_REPRESENTATIVE`, `ACCOUNTANT`, `WAREHOUSE_MANAGER`.
- [x] Integrate `assertRole` inside all Server Actions that write/modify database records (e.g., updating customer tiers/credit limits in `customer.actions.ts`).
- [x] Enforce customer ownership check (`order.userId === session.user.id`) in storefront order fetch/cancellation APIs (Design specification established for Step 5).
- [x] Implement Server Action for `dealer_approver` to review and approve/release pending orders (updating `approvalStatus` to `APPROVED`).
- [x] Implement Server Action for manual bank transfer verification and approval (restricted to `super_admin`/`accountant` via `assertRole`).
- [x] Implement Server Action for `sales_representative` to approve cancellation requests (reducing customer `currentDebt` by the order total for Trade Credit orders, or setting status to `REFUND_PENDING` for gateway orders).

### Step 3: PayOS Integration & Webhook Handler

- [x] Implement checkout API endpoint to request PayOS checkout links (calculating prices server-side from database catalog and supporting split payment configuration: 20% deposit vs. 100% full payment). At checkout time, for PAYOS orders, also insert the initial `payment_transaction` row with `status = 'PENDING'` and `referenceCode = orderCode` so the webhook has an anchor to match against.
- [x] Create raw body parser utility to extract raw request bytes from Next.js route requests (Bypassed: using Next.js parsed body with sortAndStringify for verification).
- [x] Implement `/api/payments/payos-webhook` route using timing-safe comparison (`crypto.timingSafeEqual`) to verify signatures.
- [x] Refactor webhook handler and `confirmPayOSPayment` service: lookup is now performed on `payment_transaction.referenceCode` (not `payment.transactionId`). Idempotency check uses `payment_transaction.status != 'PENDING'`. Amount mismatch check compares against `payment_transaction.amount`. On success, update both `payment_transaction.status` and `order.paymentStatus`; set `payment.status = 'COMPLETED'` only when the order reaches `FULLY_PAID`.
- [x] Implement webhook data mismatch and security check: if the paid amount does not match the expected order total/deposit, place the order on `SUSPICIOUS_PAYMENT_HOLD`, log headers, and post an alert to Telegram.

### Step 4: B2B Trade Credit & Pessimistic Locking

- [x] Implement checkout server action for B2B Trade Credit.
- [x] Implement server-side order total recalculation from database catalog prices.
- [x] Wrap checkout in a Drizzle `db.transaction()`: lock the user row using `.for("update", { noWait: true })`.
- [x] Verify limit availability: `creditLimit - currentDebt >= recalculatedTotal`. If successful, increment `currentDebt` and write Net 30/60 invoice.
- [x] Catch `NOWAIT` lock acquisition failure and return a clear HTTP 429/409 error message.
- [x] Enforce locking constraints: Ensure no external HTTP/API calls (e.g., PayOS, Zalo) are inside the `db.transaction()` block holding the lock, keeping execution time under 50ms.

### Step 5: Storefront UI, Polling & Cancellation Flows

- [ ] Implement `/api/payments/verify-status` backend API endpoint or server action for short polling (checking order payment status in DB).
- [ ] Implement the "Re-verify Payment" backend handler: calls PayOS API to query transaction status, updates the database/order status, and enforces a server-side 30-second rate limit cooldown.
- [ ] Implement a 10-minute short-polling window on the checkout success screen.
- [ ] Implement the "Re-verify Payment" button with a client-side 30-second cooldown timer.
- [ ] Build the "Request Cancellation" workflow modal on the storefront customer portal for orders already in `processing` or `shipped` state.
- [ ] Implement `POST /api/payments/generate-deposit-link` (Flow E): IDOR guard (`order.userId === session.userId`), status guard (`UNPAID` + `CASH`), call PayOS API for 20% deposit QR link, insert new `payment_transaction` row (`status = 'PENDING'`, `referenceCode = payOsOrderCode`, `transactionType = 'DEPOSIT'`, `amount = 20%`), return `checkoutUrl`.
- [ ] Implement `createPendingPaymentTransaction(orderId, amount, transactionType, referenceCode, method)` helper in `order.service.ts` — used by both checkout (PAYOS) and `generate-deposit-link`.
- [ ] Build CASH success page warning banner: yellow alert with office address, deposit amount (20% of total), 48-hour deadline — shown when `paymentMethod = 'CASH'` and `paymentStatus = 'UNPAID'`.
- [ ] Add "Pay 20% Deposit Online via VietQR" secondary button on CASH success page; on click calls `generate-deposit-link` and redirects to PayOS QR page.
- [ ] Handle PayOS webhook for CASH-order online deposits: insert `payment_transaction` with `paymentMethod = 'PAYOS'` + `transactionType = 'DEPOSIT'` + `status = 'SUCCESS'`, keep order `paymentMethod = 'CASH'`, set `paymentStatus = 'DEPOSIT_PAID'`, write Telegram outbox event.
- [ ] Build UI for B2B `dealer_approver` in the customer portal order history to review, approve, and release pending orders submitted by their `dealer_purchaser`.
- [ ] Build Admin CRM dashboard interfaces for `sales_representative` and `accountant` to review cancellation requests (and refund status) and approve manual bank transfers.

### Step 6: Real-Time & Offline Notification System

- [ ] Configure Pusher client & server instances for storefront/CRM real-time toasts, and implement a secure private channel subscription authentication API endpoint using HMAC-SHA256 tokens.
- [ ] Extend `outbox_event` schema with new communication channels (`SEND_ZALO_ZNS`, `SEND_TELEGRAM_ALERT`).
- [ ] Set up Telegram Bot alerting engine and save chat IDs to Doppler.
- [ ] Integrate Zalo Notification Service (ZNS) API client and SMS Brandname gateway providers in the codebase.
- [ ] Implement the Redis heartbeat presence mechanism: a client ping every 15 seconds and server-side tracking using the Redis key `presence:user:<userId>` with a 30-second TTL.
- [ ] Implement the outbox event processor cron job, querying pending events using an optimized `SELECT ... FOR UPDATE SKIP LOCKED` query, checking user presence, and dispatching to Pusher if online, or Zalo/Telegram/SMS if offline.
- [ ] Implement timed escalation cron worker (escalating alerts to managers and executives at 2h, 12h, and 24h).

---

## 5. Touchpoints

- `packages/database/src/schemas/auth.schema.ts`
- `packages/database/src/schemas/order.schema.ts`
- `packages/database/src/services/auth/auth.service.ts`
- `apps/admin/proxy.ts`
- `apps/storefront/app/api/payments/payos-webhook/route.ts`
- `packages/database/src/schemas/payment.schema.ts`
- `apps/storefront/src/features/checkout/actions.ts`
- `apps/storefront/src/features/cart/actions.ts`

---

## 6. Public Contracts

- `/api/payments/generate-deposit-link` (Flow E: dynamic PayOS deposit link for CASH orders)
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
