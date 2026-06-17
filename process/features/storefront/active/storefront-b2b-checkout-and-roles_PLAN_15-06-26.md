# Phase Plan: B2B Checkout Flow & User Roles Refactor

**Date**: 2026-06-17
**Complexity**: Complex
**Status**: ⏳ PLANNED

---

## 1. Overview

Implement a high-performance B2B checkout payment flow integrating **PayOS VietQR** for automated payment matching (0% transaction fee) and **B2B Trade Credit (Net Terms)** with pessimistic locking. This phase also refactors user roles to support granular internal business personas (`super_admin`, `sales_representative`, `accountant`, `warehouse_manager`) and B2B dealer sub-roles (`dealer_approver`, `dealer_purchaser`), and introduces a robust real-time notification and offline alerting system with timed escalation.

This plan conforms to the guidelines in `process/features/storefront/references/2026-06-15-checkout-and-role-refactor-design.md` and standard testing procedures in `process/context/tests/all-tests.md`.

---

## 2. Phase Completion Rules

- Database migrations run successfully, migrating old `admin` users to `super_admin` and introducing new schemas (including `payment`, `payment_transaction`, and `debt_repayment` tables) without data loss.
- Next.js route middleware and server-side `assertRole` helper restrict access to authorized roles.
- B2B Trade Credit checkout executes inside a fast transaction using pessimistic locking (`SELECT FOR UPDATE NOWAIT`) with server-side price recalculation.
- PayOS dynamic link creation, raw body signature checking, and duplicate webhook delivery handling are verified end-to-end.
- Storefront checkout pages, polling views, re-verify cooldowns, B2B debt repayment dashboard, and the "Request Cancellation" flow are fully functional.
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
- **B2B Debt Repayment**: Dealers can view outstanding debt, and repay a custom amount via PayOS or Cash, clearing their overdue locks instantly.
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
- [ ] Create `debt_repayment` table schema (`packages/database/src/schemas/payment.schema.ts` or new schema) with fields:
  - `id`: `uuid().primaryKey()`
  - `userId`: `uuid().references(() => users.id).notNull()`
  - `amount`: `numeric(15, 2).notNull()`
  - `paymentMethod`: `enum('PAYOS', 'CASH').notNull()`
  - `status`: `enum('PENDING', 'COMPLETED', 'FAILED').default('PENDING').notNull()`
  - `referenceCode`: `text().unique().notNull()`
  - `verifiedBy`: `uuid().references(() => users.id)`
  - `createdAt` / `updatedAt`
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

#### A. Backend Support APIs

- [ ] Implement `createPendingPaymentTransaction(orderId, amount, transactionType, referenceCode, method)` helper in `order.service.ts` — used by both checkout (PAYOS) and `generate-deposit-link`.
- [ ] Implement `POST /api/payments/generate-deposit-link` (Flow E): IDOR guard (`order.userId === session.userId`), status guard (`UNPAID` + `CASH`), call PayOS API for 20% deposit QR link, insert new `payment_transaction` row (`status = 'PENDING'`, `referenceCode = payOsOrderCode`, `transactionType = 'DEPOSIT'`, `amount = 20%`), return `checkoutUrl`.
- [ ] Implement `POST /api/payments/generate-repayment-link`: IDOR guard, call PayOS for debt repayment amount $X$, insert row in `debt_repayment` with `status = 'PENDING'` and `referenceCode = payOsOrderCode`, return `checkoutUrl`.
- [ ] Implement `/api/payments/verify-status` backend API endpoint or server action for short polling (checking order payment status in DB).
- [ ] Implement the "Re-verify Payment" backend handler: calls PayOS API to query transaction status, updates the database/order status, and enforces a server-side 30-second rate limit cooldown.
- [ ] Handle PayOS webhook for CASH-order online deposits: insert `payment_transaction` with `paymentMethod = 'PAYOS'` + `transactionType = 'DEPOSIT'` + `status = 'SUCCESS'`, keep order `paymentMethod = 'CASH'`, set `paymentStatus = 'DEPOSIT_PAID'`, write Telegram outbox event.
- [ ] Handle PayOS webhook for debt repayments: update `debt_repayment` to `COMPLETED`, lock user row via `SELECT FOR UPDATE NOWAIT`, deduct amount from `currentDebt`, delete Redis block key `user:overdue-lock:<userId>`.

#### B. Checkout Flow & Overdue Limits UI

- [ ] Create Checkout Page (`apps/storefront/app/[locale]/(shop)/checkout/page.tsx`):
  - **Shipping Address Form**: Input validation (recipient name, phone, address, city/province).
  - **Payment Option Selector**: Radio card choices: `DEPOSIT` (Pay 20% Deposit Online) or `FULL` (Pay 100% Full Payment Online). Shows dynamic amount calculations.
  - **Payment Method Cards**: Cards for `PAYOS` (VietQR), `CASH` (Office Payment), and `TRADE_CREDIT` (B2B Net Terms).
  - **Trade Credit Overdue Guard**:
    - Fetch user status from `/api/users/profile`.
    - If user has overdue debt or is locked, display red alert: _"Hạn mức Trade Credit của bạn đã bị khóa do có nợ quá hạn (>30 ngày). Vui lòng thanh toán trước."_, disable the `TRADE_CREDIT` option, and provide a CTA button redirecting to `/portal/debt`.
  - **Purchaser Role Alert**: If role is `dealer_purchaser`, display info banner: _"Đơn hàng này cần có phê duyệt của Dealer Approver để hoàn tất thanh toán."_
  - **Submit Button**: Trigger `POST /api/checkout` with fullscreen spinner showing progress.
- [ ] Create Mock Payment Page (`apps/storefront/app/[locale]/(shop)/checkout/mock-payment/page.tsx`):
  - Simulates the PayOS redirect page for local testing.
  - Interactive buttons to simulate success webhook, amount mismatch webhook, and cancellation back-routing.

#### C. Checkout Success & Verification UI

- [ ] Create Checkout Success Page (`apps/storefront/app/[locale]/(shop)/checkout/success/page.tsx`):
  - **PAYOS Order View**: Renders total transaction amount, bank details, dynamic VietQR code image, and payment description.
  - **Webhook Status Polling**:
    - Trigger 5-second short polling to `/api/payments/verify-status`.
    - Automatically redirect to customer dashboard once payment status changes to `DEPOSIT_PAID` or `FULLY_PAID`.
    - Handle 10-minute timeout: display "Keep Waiting" prompt if timer reaches zero.
  - **Re-verify Payment Button**:
    - Renders button triggering the server action to fetch status directly from PayOS.
    - Handles client-side 30-second cooldown timer, displaying a countdown and disabling clicks.
  - **CASH Order Warning Banner**:
    - If payment method is `CASH` and status is `UNPAID`, display a yellow warning: _"Đơn hàng chưa được xử lý. Vui lòng thanh toán 20% đặt cọc (X VNĐ) tại văn phòng trong vòng 48 giờ."_
    - Render secondary button: _"Thanh toán cọc 20% Online qua VietQR"_. Clicking generates the PayOS deposit link and redirects.

#### D. Customer Portal Order History & B2B Approvals UI

- [ ] Create Order Details View (`apps/storefront/app/[locale]/(shop)/portal/orders/[id]/page.tsx`):
  - Display full payment breakdown and timeline.
  - "Xác thực thanh toán" (Re-verify Payment) button for stuck `PENDING_VERIFICATION` orders (with 30-second countdown).
  - **Trade Credit Cancellation Button (Flow C)**:
    - If status is `PENDING`, render "Hủy đơn hàng" which cancels immediately.
    - If status is `PROCESSING` or later, render "Yêu cầu hủy đơn" (Request Cancellation) which opens a modal and sets status to `CANCELLATION_REQUESTED`.
  - **Dealer Approver Approval Tab**:
    - If user is `dealer_approver`, render "Đơn hàng chờ duyệt" tab.
    - Lists orders placed by `dealer_purchaser`.
    - Provide `Phê duyệt` button (triggers pessimistic limit locking and updates order to `APPROVED`) and `Từ chối` button (cancels order).

#### E. B2B Debt Repayment UI

- [ ] Create Debt Repayment Dashboard (`apps/storefront/app/[locale]/(shop)/portal/debt/page.tsx`):
  - Shows current outstanding debt (`currentDebt`), available credit (`creditLimit - currentDebt`), and lists overdue net-term invoices.
  - **Repayment Widget**:
    - Input field for custom repayment amount $X$ (validates $X > 0$ and $X \le currentDebt$).
    - Payment selector: `PAYOS` or `CASH`.
    - For `PAYOS`: Clicking "Thanh toán VietQR" triggers dynamic link generation and redirects to PayOS.
    - For `CASH`: Displays invoice details and receipt instructions to bring to the office.

#### F. Admin CRM Dashboard UI

- [ ] Build CRM interfaces in Admin App (`apps/admin`):
  - **Sales Rep Dashboard**: Add approval list for orders under `CANCELLATION_REQUESTED`, allowing them to approve (and release Trade Credit limit) or reject.
  - **Accountant Dashboard**: Add manual bank/cash payment verification widget, allowing them to enter a cash receipt number, record payment in `payment_transaction`, and set order to `DEPOSIT_PAID` / `FULLY_PAID`.

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
- `packages/database/src/schemas/payment.schema.ts`
- `packages/database/src/schemas/payment-transaction.schema.ts`
- `packages/database/src/services/order/order.service.ts`
- `apps/admin/proxy.ts`
- `apps/admin/app/[locale]/(dashboard)/orders/[id]/page.tsx`
- `apps/admin/src/features/orders/components/order-detail.tsx`
- `apps/storefront/app/[locale]/(shop)/checkout/page.tsx`
- `apps/storefront/app/[locale]/(shop)/checkout/success/page.tsx`
- `apps/storefront/app/[locale]/(shop)/portal/orders/[id]/page.tsx`
- `apps/storefront/app/[locale]/(shop)/portal/debt/page.tsx`
- `apps/storefront/app/api/checkout/route.ts`
- `apps/storefront/app/api/payments/payos-webhook/route.ts`

---

## 6. Public Contracts

- `/api/payments/generate-deposit-link` (Flow E: dynamic PayOS deposit link for CASH orders)
- `/api/payments/generate-repayment-link` (Dynamic PayOS debt repayment link)
- `/api/payments/payos-webhook` (PayOS Webhook URL)
- `/api/payments/verify-status` (Short polling checkout verification endpoint)
- `assertRole(allowedRoles: UserRole[])` shared backend helper

---

## 7. Blast Radius

- **High impact**: Database schemas (requires migration for the new `debt_repayment` table and previous role/order tables).
- **High impact**: Access control (role enum changes will affect all users, necessitating script execution).
- **Moderate impact**: Storefront checkouts, B2B pricing, and cart flows.
- **Zero impact**: Static product and categories routes.

---

## 8. Verification Evidence

- Run types validation: `tsc --noEmit` on the entire monorepo.
- Run Drizzle migration check: `bun run db:generate` and check generated SQL files.
- Run unit tests for pessimistic locking and limit calculation: `bun test packages/database/src/services/user/user.service.test.ts`.
- Simulate PayOS webhook signature verification using test vectors to assert timing-safe hash matching.
- Verify outbox email and bot notification queues on local developer channels.
