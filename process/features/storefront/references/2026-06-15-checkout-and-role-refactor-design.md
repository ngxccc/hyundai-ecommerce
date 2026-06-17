# Design Specification: B2B Checkout Flow & User Roles Refactor

**Date**: 2026-06-15
**Author**: Antigravity (Advanced Agentic Coding Agent)
**Status**: Approved (User-confirmed & Multi-Agent Predict-Reviewed)

---

## 1. Context and Goals

This design specification details the implementation of a high-performance B2B checkout and order payment flow for the Hyundai E-Commerce platform. It also replaces the generic `admin` role with semantic internal company roles to support a multi-user corporate workflow.

### Goals

- Integrate **PayOS** for 0%-fee automatic VietQR payment matching.
- Support **B2B Trade Credit (Net Terms)** for authorized Dealers, Contractors, and Distributors to check out using credit limits.
- Refactor database roles to support distinct business personas: `super_admin`, `sales_representative`, `accountant`, `warehouse_manager`, `dealer_approver`, `dealer_purchaser`, and `customer`.
- Support split payments (20% deposit online, 80% remainder online or offline) and manual bank transfer fallback.
- Ensure strict transaction safety (idempotency, pessimistic locking, raw body webhook validation, and clear audit logging).
- Implement a robust, real-time notification and offline alerting system to handle immediate payment matching notifications, credit approvals, and on-duty escalation.

---

## 2. Refactored User Roles

The database `user_role` enumeration is refactored from `admin, dealer, customer` to:

| Role Name              | Scope    | Permissions                                                                               |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `super_admin`          | Internal | Full system administration, database configuration, and system-wide overrides.            |
| `sales_representative` | Internal | Manage quote requests, negotiate prices with dealers, view deals pipeline.                |
| `accountant`           | Internal | Review payments, verify manual bank transfers, approve/set credit limits, view billing.   |
| `warehouse_manager`    | Internal | Manage stock levels, view orders ready for shipment, log shipments.                       |
| `dealer_approver`      | External | B2B account owner/approver. Has authority to approve trade credit usage and place orders. |
| `dealer_purchaser`     | External | B2B purchasing staff. Can build carts and initiate checkouts, but needs approval.         |
| `customer`             | External | Standard retail buyer. Instant/deposit payment via gateway or bank transfer.              |

---

## 3. Database Schema Extensions

### Schema Changes (`packages/database/src/schemas/auth.schema.ts`)

```typescript
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "sales_representative",
  "accountant",
  "warehouse_manager",
  "dealer_approver",
  "dealer_purchaser",
  "customer",
]);
```

### Table Schema Updates

#### 1. Users Table (`user`)

- `creditLimit`: `numeric(15, 2)` (Default: `0.00`) — Maximum approved trade credit for B2B accounts.
- `currentDebt`: `numeric(15, 2)` (Default: `0.00`) — Outstanding debt balance of the customer.

#### 2. Orders Table (`order`)

- `paymentMethod`: `enum('PAYOS', 'CASH', 'TRADE_CREDIT')`
- `paymentStatus`: `enum('UNPAID', 'DEPOSIT_PAID', 'FULLY_PAID', 'PENDING_VERIFICATION')`
- `approvalStatus`: `enum('APPROVED', 'PENDING_APPROVAL')` (Default: `'APPROVED'` for retail/approver, `'PENDING_APPROVAL'` for purchaser)

#### 3. Payment Table (`payment` — 1 row per order)

Represents the financial obligation of the order. See [Section 3.5](#35-payment-data-model-contract) for the full contract.

- `id`: `uuid().primaryKey()`
- `orderId`: `uuid().references(() => orders.id).notNull()` — 1:1 with order
- `amount`: `numeric(15, 2).notNull()` — Always `totalAmount` (100%); never the deposit amount
- `method`: `paymentMethodEnum().notNull()` — Primary payment method of the order (`PAYOS / CASH / TRADE_CREDIT`)
- `status`: `enum('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')` — Set to `COMPLETED` only when the order reaches `FULLY_PAID`
- `rawPayload`: `text()` — Optional: raw PayOS webhook payload for audit

> `transactionId` has been removed. Webhook lookup is performed via `payment_transaction.referenceCode`.

#### 4. Payment Transactions Table (`payment_transaction` — N rows per order)

Tracks each individual money-collection event. Multiple rows per order for split payments (deposit + remainder).

- `id`: `uuid().primaryKey()`
- `orderId`: `uuid().references(() => orders.id).notNull()`
- `amount`: `numeric(15, 2).notNull()` — Actual amount for this session (20% / 80% / 100%)
- `paymentMethod`: `enum('PAYOS', 'CASH').notNull()` — Method used for this specific transaction
- `transactionType`: `enum('DEPOSIT', 'REMAINDER', 'FULL').notNull()`
- `status`: `enum('PENDING', 'SUCCESS', 'FAILED').notNull()` — `PENDING` when PayOS session opens; `SUCCESS` after webhook fires or cash confirmed
- `referenceCode`: `text().unique().notNull()` — PayOS `orderCode` or cash receipt number; primary webhook lookup key enforcing idempotency
- `verifiedBy`: `uuid().references(() => users.id)` — Accountant ID; set only for manual cash confirmations
- `createdAt` / `updatedAt`

#### 5. Credit Limit History Table (`credit_limit_history` — New Table)

Provides audit logs for all credit limit updates for compliance.

- `id`: `uuid().primaryKey()`
- `userId`: `uuid().references(() => users.id)` (The B2B account)
- `oldLimit`: `numeric(15, 2).notNull()`
- `newLimit`: `numeric(15, 2).notNull()`
- `changedBy`: `uuid().references(() => users.id)` (The accountant or admin who performed the change)
- `reason`: `text()`
- `createdAt`: `timestamp().defaultNow()`

#### 4. Credit Limit History Table (`credit_limit_history` - New Table)

Provides audit logs for all credit limit updates for compliance.

- `id`: `uuid().primaryKey()`
- `userId`: `uuid().references(() => users.id)` (The B2B account)
- `oldLimit`: `numeric(12, 2).notNull()`
- `newLimit`: `numeric(12, 2).notNull()`
- `changedBy`: `uuid().references(() => users.id)` (The accountant or admin who performed the change)
- `reason`: `text()`
- `createdAt`: `timestamp().defaultNow()`

---

## 3.5 Payment Data Model Contract

The payment subsystem uses two tables with distinct, non-overlapping responsibilities:

```text
orders (1)
  └── payment (1)               — financial obligation of the order
  └── payment_transaction[] (N) — each individual money-collection event
```

### `payment` — Obligation

Represents what the customer owes for an order. Always holds the full order value regardless of how many installments are collected.

| Field    | Value                         | Rule                                                    |
| -------- | ----------------------------- | ------------------------------------------------------- |
| `amount` | `totalAmount` (100%)          | Never changes; reflects the total obligation            |
| `method` | `PAYOS / CASH / TRADE_CREDIT` | Primary payment method of the order                     |
| `status` | `PENDING → COMPLETED`         | Set to `COMPLETED` only when order reaches `FULLY_PAID` |

> `transactionId` has been removed. Webhook lookup is performed via `payment_transaction.referenceCode` instead.

### `payment_transaction` — Each Money-Collection Event

Inserted whenever money actually moves (or a payment session is opened). Multiple rows per order for split payments.

| Field             | Value                                  | Rule                                                              |
| ----------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `amount`          | Actual amount for this session         | 20% for DEPOSIT, 80% for REMAINDER, 100% for FULL                 |
| `paymentMethod`   | `PAYOS / CASH`                         | Method used for this specific transaction                         |
| `transactionType` | `DEPOSIT / REMAINDER / FULL`           | Lifecycle stage of the payment                                    |
| `status`          | `PENDING → SUCCESS / FAILED`           | `PENDING` when PayOS session opens; `SUCCESS` after webhook fires |
| `referenceCode`   | PayOS orderCode or cash receipt number | **Primary webhook lookup key** — unique, enforces idempotency     |
| `verifiedBy`      | Accountant UUID                        | Set only for manual cash confirmations                            |

### When `payment_transaction` rows are created

| Scenario                                         | Created by                       | Initial `status` |
| ------------------------------------------------ | -------------------------------- | ---------------- |
| PAYOS checkout (DEPOSIT or FULL)                 | Checkout API, after PayOS link   | `PENDING`        |
| CASH deposit paid online (generate-deposit-link) | `generate-deposit-link` API      | `PENDING`        |
| CASH deposit paid at office                      | Accountant via CRM Server Action | `SUCCESS`        |
| REMAINDER 80% paid via PayOS                     | `generate-remainder-link` API    | `PENDING`        |
| REMAINDER 80% paid at office (CASH)              | Accountant via CRM Server Action | `SUCCESS`        |

### Detailed Payment Lifecycle Examples

#### Case 1: PAYOS Checkout with 20% Deposit

**Checkout API flow**:

1. Call PayOS API → receive `orderCode`.
2. `INSERT payment (amount = totalAmount, method = 'PAYOS', status = 'PENDING')` — records the full obligation.
3. `INSERT payment_transaction (amount = 20% of total, transactionType = 'DEPOSIT', referenceCode = orderCode, status = 'PENDING', paymentMethod = 'PAYOS')` — creates the pending PayOS session anchor for webhook lookup.
4. Redirect customer to PayOS QR page.

**Webhook processing**:

1. Lookup: `payment_transaction WHERE referenceCode = orderCode AND status = 'PENDING'`.
2. Retrieve `orderId` from the found row.
3. Amount check: compare `data.amount` received from PayOS against `payment_transaction.amount` (the 20% value).
4. If match: `UPDATE payment_transaction.status = 'SUCCESS'`, `UPDATE order.paymentStatus = 'DEPOSIT_PAID'`.
5. If mismatch: `UPDATE payment_transaction.status = 'FAILED'`, `UPDATE order.status = 'SUSPICIOUS_PAYMENT_HOLD'`, raise Telegram alert.

#### Case 2: PAYOS Checkout with 100% Full Payment

Identical to Case 1, except:

- `payment_transaction.amount = totalAmount`, `transactionType = 'FULL'`.
- Webhook sets `order.paymentStatus = 'FULLY_PAID'` and `payment.status = 'COMPLETED'`.

#### Case 3: Paying the 80% Remainder (Second Installment)

**generate-remainder-link API** (similar to `generate-deposit-link`):

1. Call PayOS API → receive a **new** `orderCode`.
2. `INSERT payment_transaction (amount = 80% of total, transactionType = 'REMAINDER', referenceCode = newOrderCode, status = 'PENDING', paymentMethod = 'PAYOS')`.

**Webhook**:

- Sets `order.paymentStatus = 'FULLY_PAID'`.
- Sets `payment.status = 'COMPLETED'`.

#### Case 4: CASH Checkout

**Checkout API flow**:

1. `INSERT payment (amount = totalAmount, method = 'CASH', status = 'PENDING')` — records the full obligation.
2. **No** `payment_transaction` row is created at checkout time (no money has moved yet).

**Two possible collection paths**:

- **Customer pays cash at the office** (accountant confirms via CRM):
  - `INSERT payment_transaction (amount = 20%, transactionType = 'DEPOSIT', referenceCode = <receipt number>, status = 'SUCCESS', paymentMethod = 'CASH', verifiedBy = accountantId)`.
  - `UPDATE order.paymentStatus = 'DEPOSIT_PAID'`.

- **Customer clicks "Pay 20% Online via VietQR"** on the success page:
  - `generate-deposit-link` API calls PayOS → receives `orderCode`.
  - `INSERT payment_transaction (amount = 20%, transactionType = 'DEPOSIT', referenceCode = orderCode, status = 'PENDING', paymentMethod = 'PAYOS')`.
  - Webhook processing follows the same logic as Case 1.
  - `order.paymentMethod` remains `'CASH'` (the remaining 80% is still expected in cash at the office).

### Webhook lookup contract

```text
PayOS fires → { orderCode, amount, reference }
  1. Look up: payment_transaction WHERE referenceCode = orderCode AND status = 'PENDING'
  2. If not found → idempotency: already processed or unknown → return 200 OK
  3. Get orderId from payment_transaction.orderId
  4. Mismatch check: |amount_received - payment_transaction.amount| > 0.01
       → FAILED tx + SUSPICIOUS_PAYMENT_HOLD
  5. Match: UPDATE payment_transaction.status = SUCCESS
            UPDATE order.paymentStatus = DEPOSIT_PAID | FULLY_PAID
            If FULLY_PAID: UPDATE payment.status = COMPLETED
```

---

## 4. Payment Flows & Webhook Integration

### Flow A: Automatic VietQR payment via PayOS

- When selecting QR payment, the system invokes PayOS API to generate a dynamic link.
- The link renders a QR code with Hyundai's bank details and a unique reference code.
- **Mandatory 20% Deposit Rule**: Both `PAYOS` and `CASH` payment methods require a 20% deposit before the order is processed. The deposit amount is calculated as:

  ```ts
  depositAmount = Math.round(totalAmount * FINANCIAL_CONSTANTS.DEPOSIT_RATE);
  // FINANCIAL_CONSTANTS.DEPOSIT_RATE = 0.2
  ```

  The remaining 80% is settled later according to each method's own flow:

  | Method  | 20% Deposit                                          | Remaining 80%                       |
  | ------- | ---------------------------------------------------- | ----------------------------------- |
  | `PAYOS` | PayOS VietQR (online)                                | PayOS VietQR (online, 2nd link)     |
  | `CASH`  | Cash at office **or** PayOS VietQR (optional switch) | Cash at office upon receiving goods |

- **Webhook Signature Verification (Raw Body)**:
  - The webhook handler MUST parse the **raw request body string** (not the parsed JSON) to calculate the HMAC-SHA256 checksum and verify against the header signature.
  - The signature verification MUST use a constant-time string comparison (`crypto.timingSafeEqual`) to eliminate timing attacks.
- **Webhook Idempotency & Processing**:
  1. PayOS fires a Webhook to `/api/payments/payos-webhook`.
  2. The webhook handler opens a database transaction and checks if `referenceCode` already exists in `payment_transaction`.
  3. If it exists, returns `208 Already Reported` or `200 OK` immediately to gracefully ignore duplicate webhook deliveries.
  4. If new, updates `paymentStatus` to `DEPOSIT_PAID` or `FULLY_PAID`, inserts the transaction, and writes any heavy background tasks (email notifications, PDF invoices) to the `outbox_event` table inside the _same_ database transaction to ensure atomicity.
  5. Returns `200 OK` (under 2 seconds).
- **UI Synchronization & Polling**:
  - The storefront checkout page uses short polling (checking order payment status every 5 seconds) for up to 10 minutes (to allow for Maker-Checker B2B approvals).
  - The payment details, dynamic QR code, and checkout instructions remain visible, and a "Keep Waiting" prompt is offered when approaching the timeout.
- **Re-verify Payment Option**:
  - The checkout timeout screen and the customer portal order detail page display a "Re-verify Payment" button when the order's payment status is `PENDING_VERIFICATION`.
  - Clicking this triggers a server-side API call to PayOS to fetch the transaction status and update the database immediately, resolving stuck payment states.
  - Rate limiting is enforced: the button is disabled for 30 seconds after a click (showing a countdown timer) and server-side rate limits are applied.

- **Workflow Flowchart**:

  ```text
                  [Customer selects QR Payment]
                                │
                                ▼
                   [Create dynamic PayOS Link]
                                │
                                ▼
                   [Customer scans VietQR & pays]
                                │
                                ▼
                  [PayOS triggers Webhook API]
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼ (Signature Valid)                           ▼ (Signature Invalid)
  [Open DB Transaction]                           [Return 400 Bad Request]
         │
         ▼
  [Reference Code exists?]
   ├── Yes ──► [Return 200 OK / 208 Already Reported] (Idempotency)
   └── No  ──► [Process Payment]
                  │
        ┌─────────┴─────────┐
        ▼ (Amount Matches)   ▼ (Amount Mismatch)
  [Set FULLY_PAID/DEPOSIT]    [Set SUSPICIOUS_PAYMENT_HOLD]
  [Insert SUCCESS Tx]         [Insert FAILED Tx]
  [Write Outbox events]       [Insert Telegram alert Outbox]
  [Return 200 OK]             [Return 200 OK]
  ```

### Flow E: CASH Checkout — Office Deposit & Online PayOS Fallback

- **Checkout Step**:
  - API creates the order with `paymentMethod = 'CASH'`, `paymentStatus = 'UNPAID'`, `orderStatus = 'PENDING'`.
  - A payment record is created with `method = 'CASH'`, `status = 'PENDING'`, `amount = totalAmount`.
  - API returns `checkoutUrl = /checkout/success?orderId=xxx` — no PayOS link is generated at this stage.
- **Success Page Warning**:
  - If the order has `paymentMethod = 'CASH'` and `paymentStatus = 'UNPAID'`, the page displays:
    - A yellow warning banner: _"Your order is not yet processed. Please visit our office at [address] to pay the 20% deposit (X VND) within 48 hours."_
    - A secondary button: _"Pay 20% Deposit Online via VietQR"_.
- **Dynamic PayOS Deposit Link Generation** (`POST /api/payments/generate-deposit-link`):
  - Triggered only when the customer clicks the online payment button.
  - Server Action performs:
    1. Ownership verification (IDOR guard): `order.userId === session.userId`.
    2. Status guard: order must still be `UNPAID` and `paymentMethod = 'CASH'`.
    3. Calls PayOS API to generate a QR link for `depositAmount` (20% of total).
    4. Inserts `payment_transaction` with `referenceCode = payOsOrderCode`, `amount = depositAmount`, `transactionType = 'DEPOSIT'`, `status = 'PENDING'`, `paymentMethod = 'PAYOS'` — this is the webhook lookup anchor.
    5. Returns `checkoutUrl` pointing to PayOS QR page.
- **Webhook Handler for Cash-Order Deposit** (`/api/payments/payos-webhook`):
  - Upon successful PayOS deposit payment:
    - Inserts `payment_transaction` with `paymentMethod = 'PAYOS'`, `transactionType = 'DEPOSIT'`, `status = 'SUCCESS'`.
    - Order `paymentMethod` remains `'CASH'` (the 80% remainder is still expected as cash at the office).
    - Updates `paymentStatus = 'DEPOSIT_PAID'`.
    - Writes outbox event to notify the warehouse team and sales team via Telegram.
- **Workflow Flowchart**:

  ```text
       [Customer selects CASH Checkout]
                      │
                      ▼
       [Create order: CASH / UNPAID / PENDING]
                      │
                      ▼
       [Redirect to /checkout/success]
                      │
                      ▼
       [Show warning banner + "Pay 20% Online" button]
                      │
           ┌──────────┴──────────┐
           ▼ (Goes to office)    ▼ (Clicks "Pay Online")
   [Pays cash deposit        [POST /api/payments/generate-deposit-link]
    at office]                          │
           │                    [IDOR check + UNPAID status check]
           │                            │
           │                   [Call PayOS API → QR link]
           │                   [Insert payment_transaction PENDING]
           │                            │
           │                   [Redirect to PayOS QR page]
           │                            │
           │                   [Customer scans & pays 20%]
           │                            │
           │                   [PayOS Webhook triggered]
           │                            │
           │                   [Insert PAYOS/DEPOSIT tx]
           │                   [Keep paymentMethod = CASH]
           └──────────────────►[paymentStatus = DEPOSIT_PAID]
                                         │
                                         ▼
                            [Order ready for processing]
  ```

### Flow B: B2B Trade Credit (Net Terms) & Pessimistic Locking

- Available only to roles `dealer_approver` / `dealer_purchaser` / business types with approved `creditLimit`.
- **Submit for Approval Flow**:
  - If checkout is initiated by a `dealer_purchaser`, the order total is calculated but instead of executing Trade Credit immediately, the order is created with `approvalStatus = 'PENDING_APPROVAL'`. The `dealer_approver` is notified to review and release the order.
- **Order Checkout Execution**:
  1. System recalculates the order total server-side by querying the database product catalog prices (never trusting client-submitted pricing fields).
  2. The system opens a database transaction and applies a pessimistic lock (`SELECT FOR UPDATE`) on the target `user` row.
  3. **Lock Constraint**: No external HTTP calls (such as PayOS or third-party APIs) are allowed inside the transaction holding the lock. The transaction block must be kept under 50ms.
  4. If `creditLimit - currentDebt >= recalculatedTotal`:
     - Creates order with `paymentMethod = 'TRADE_CREDIT'` and `paymentStatus = 'UNPAID'`.
     - Increments `currentDebt` by the order total in the locked row.
     - Generates a Net 30/60 invoice.
     - Commits transaction. If concurrently modified, it rolls back or waits.

- For repayment, B2B users pay off their debt via PayOS or Cash (see Flow E below).
- **Workflow Flowchart**:

  ```text
               [Customer selects Trade Credit Checkout]
                                  │
                                  ▼
                     [Recalculate Order Total]
                                  │
                                  ▼
                   [Open DB Tx & Lock User Row]
                   (SELECT FOR UPDATE NOWAIT)
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼ (Lock Acquired)                                 ▼ (Lock Fails - Concurrent)
  [Is Customer a DEALER_PURCHASER?]                    [Return 429/409 Fail Fast]
   ├── Yes ──► [Set PENDING_APPROVAL]
   │           [Insert order/items]
   │           [Write Telegram outbox alert]
   │           [Commit DB Tx]
   │
   └── No  ──► [Check Available Credit]
                 ├── Less than Total ──► [Rollback & Throw insufficientCreditLimit]
                 └── More than Total ──► [Set APPROVED]
                                         [Increment currentDebt]
                                         [Generate Net 30/60 invoice]
                                         [Commit DB Tx]
  ```

### Flow C: Refunds & Order Cancellation Constraints

- **Insecure Direct Object Reference (IDOR) Protection**:
  - The cancellation and detail APIs must perform ownership verification: verifying that the order's `userId` matches the authenticated session's `userId`.
- **Trade Credit cancellation**:
  - B2B users are only allowed to self-cancel orders using Trade Credit if the order status is still `pending`.
  - Once the order transitions to `processing`, `shipped`, or `delivered`, the self-cancel option is disabled on the storefront and replaced by a **"Request Cancellation"** action.
  - Clicking "Request Cancellation" opens a modal explaining the hold, updates the order to `CANCELLATION_REQUESTED`, and routes a high-priority approval task to the assigned `sales_representative` in the Admin CRM.
  - When successfully cancelled and approved, the system automatically reduces `currentDebt` by the order total.

- **Online Gateway refunds**: If a PayOS order is cancelled, the order changes status to `REFUND_PENDING`. The Accountant reviews the refund request and manually processes the transfer via bank account, then updates the system status.
- **Workflow Flowchart**:

  ```text
                      [Customer requests Cancellation]
                                     │
                                     ▼
                      [Ownership Check (IDOR Guard)]
                      (Does Order.userId == Session.userId?)
                                     │
            ┌────────────────────────┴────────────────────────┐
            ▼ (Owner Matches)                                 ▼ (Not Owner)
   [Check Order Status]                              [Return 403 Forbidden]
            │
      ┌─────┴────────────────────────────────┐
      ▼ (Status is PENDING)                  ▼ (Status is PROCESSING or later)
  [Set status = CANCELLED]               [Set status = CANCELLATION_REQUESTED]
  [Release Trade Credit limit]           [Insert CRM sales rep outbox alert]
  (currentDebt = currentDebt - Total)          │
                                              ▼
                                 [Sales Rep approves on CRM]
                                              │
                                              ▼
                                 [Set status = CANCELLED]
                                 [Release Trade Credit limit]
  ```

### Flow D: B2B Debt Repayment & Overdue Locking Flow

- **Net 30 Due Date (Hạn thanh toán)**:
  - All orders purchased using credit limit (`paymentMethod = 'TRADE_CREDIT'`) that are not fully paid (`paymentStatus != 'FULLY_PAID'`) after 30 days of creation (`createdAt < NOW() - 30 days`) are flagged as **Overdue Debt**.
- **Overdue Checkout Lock (Cơ chế Khóa đặt hàng)**:
  - If a B2B user has any overdue debt, the system blocks them from checking out new orders using `TRADE_CREDIT`.
  - **Performance Optimization via Redis (Hybrid Cache)**:
    - The block status of the user is cached in Redis with key `user:overdue-lock:<userId>`.
    - UI views (cart page, checkout page) and access check APIs read this Redis key directly to hide checkout buttons and display a red warning banner.
    - At the moment the checkout submit action is actually triggered (Checkout API), the system executes a fast SQL index-scan query in the database to guarantee data security and prevent cache drift.
- **Debt Repayment Feature (Thanh toán dư nợ)**:
  - The Customer Portal displays current outstanding debt (`currentDebt`), available credit (`creditLimit - currentDebt`), and a list of overdue invoices with a "Repay Debt" button.
  - The user can input the repayment amount $X$ and choose one of the following methods:
    1. **PayOS (VietQR) - Automatic Matching**:
       - The system creates a payment transaction in the `debt_repayment` table with `status = 'PENDING'` and generates a dynamic PayOS payment link.
       - Upon scanning and paying successfully, PayOS triggers the webhook `/api/payments/payos-webhook`.
       - The webhook handler updates the `debt_repayment` record to `COMPLETED`, locks the user row (`SELECT FOR UPDATE NOWAIT`), subtracts the amount from `currentDebt` (`currentDebt = currentDebt - X`), logs the payment transaction, and deletes the Redis block key `user:overdue-lock:<userId>`.
    2. **Cash (CASH) - Manual Verification**:
       - The customer makes a cash payment at the office.
       - The Accountant logs in to the Admin CRM, registers the cash receipt, creates a `debt_repayment` record with `status = 'COMPLETED'`, decrements `currentDebt`, and deletes the Redis block key.
- **Workflow Flowchart**:

  ```text
                               [DEALER CHECKOUT ORDER]
                                          │
                                          ▼
                             [Check Overdue Debt in DB]
                             - Query DB: Unpaid TRADE_CREDIT orders > 30 days?
                             - Read Redis: user:overdue-lock:<userId>
                                          │
                      ┌───────────────────┴───────────────────┐
                      ▼ (Has Overdue Debt)                    ▼ (No Overdue Debt)
               [CHECKOUT LOCKED]                     [ALLOW CHECKOUT]
           - Display warning banner              - Process B2B Trade Credit
           - Display "Repay Debt" button
                      │
                      ▼
               [DEALER REPAYS DEBT]
                      │
           ┌──────────┴──────────┐
           ▼ (via PayOS QR)      ▼ (via Cash)
      - Enter repayment amount.  - Pay cash at office.
      - Create `debt_repayment`  - Accountant enters CRM.
        (PENDING).               - Create `debt_repayment`
      - Scan VietQR code.          (COMPLETED) & deduct debt.
      - PayOS Webhook.                 │
           │                           │
           ▼                           ▼
    [Set `COMPLETED` & deduct currentDebt in DB]
    - currentDebt = currentDebt - X
    - Delete Redis block key user:overdue-lock:<userId>
    - Customer is unlocked instantly.
  ```

- **Database Schema (`debt_repayment` table)**:
  - `id`: `uuid().primaryKey()` (Transaction ID)
  - `userId`: `uuid().references(() => users.id).notNull()` (ID of the Dealer repaying debt)
  - `amount`: `numeric(15, 2).notNull()` (Repayment amount)
  - `paymentMethod`: `enum('PAYOS', 'CASH').notNull()` (Payment method: PayOS or Cash)
  - `status`: `enum('PENDING', 'COMPLETED', 'FAILED').default('PENDING').notNull()` (Repayment status)
  - `referenceCode`: `text().unique().notNull()` (PayOS orderCode or Cash receipt reference number)
  - `verifiedBy`: `uuid().references(() => users.id)` (ID of the Accountant who verified Cash payment)
  - `createdAt` / `updatedAt`
- **Escalation Matrix (Leo thang cảnh báo)**:
  - **Overdue 1 Day**: Automatically send Zalo ZNS debt reminder to `dealer_approver`.
  - **Overdue 5 Days**: Mark dealer status as Red on Admin CRM and send debt alert to the internal sales Telegram group.
  - **Overdue 10 Days**: Temporarily suspend credit limit (temporarily sets available credit limit to 0) until overdue invoices are fully settled.

---

## 5. Real-Time Notification & Offline Alerting Architecture

To guarantee low latency, robust data delivery, and zero missed critical alerts, the system integrates a real-time notification engine with offline fallback capabilities.

### 5.1 Real-Time Subscription Stack (MVP vs. Scale)

- **MVP Strategy**: Use a managed WebSocket platform like **Pusher / Ably** inside their free tiers (up to 100-200 concurrent connections, $0/month). It eliminates setup complexity (SSL certificates, horizontal socket routing, clustering) and handles auto-reconnections natively.
- **Long-Term Scaling Strategy**: Migrate to a self-hosted stateful **Bun WebSocket server (or Soketi)** running inside Docker containers on local cloud providers (e.g., Viettel IDC or Vietnix). A clustered Bun server backed by a **Redis Pub/Sub** backplane costs ~$5/month while comfortably handling 100k+ concurrent idle connections.
- **Subscription Authentication**: All client subscriptions to private user channels (e.g., `private-user-user_uuid`) must authenticate using an HMAC-SHA256 token signed by the server's private key to prevent tenant data sniffing.

### 5.2 Transactional Outbox Pattern for Alerts

To prevent database connection pool saturation, publishing notifications is decoupled from database transactions.

1. When a business event happens (such as a payment webhook or quote submission), the transaction block writes the main tables and inserts a notification request in the `outbox_event` table.
2. A background cron worker (running every 10 seconds under Bun or 1 minute under Vercel Serverless) queries `PENDING` events using a fail-safe optimistic query (`SELECT ... FOR UPDATE SKIP LOCKED`).
3. The worker dispatches notifications to the target channel (WebSockets/Pusher if online, or fallback channels if offline) and updates the status to `PROCESSED`.

### 5.3 Connection Heartbeat Presence

The platform checks user connectivity before routing messages to save costs on external SMS/Zalo.

- **Redis Heartbeat**: When clients connect, the server registers a key `presence:user:<userId>` with a 30-second TTL. The client browser pings every 15 seconds.
- **Offline Detection**: If the presence key is missing when an alert is fired, the fallback offline routing engine is activated instantly.

### 5.4 Offline Local Fallback Channels (Vietnam Context)

When dealers or staff members are offline, notifications are automatically routed to local communication tools:

#### A. External Dealers: Zalo Notification Service (ZNS) & SMS

- **Primary Channel**: **Zalo ZNS** is the primary B2B customer update channel in Vietnam due to high adoption and low cost (~200 - 300 VNĐ per transactional message, free on failed delivery). It allows interactive call-to-action buttons (redirection to payment or order history).
- **Setup**: Requires a verified Zalo Official Account (OA) and pre-approval of message templates by VNG.
- **Secondary Channel (SMS Brandname)**: Used as a backup for users without a Zalo account. Cost is higher (~500 - 850 VNĐ per message) and content is restricted to plain text.

#### B. Internal Staff & CRM Alerts: Telegram / Slack Bots

- **Primary Channel**: **Telegram & Slack Bots** are used for internal CRM notifications. They are **100% free** and support inline interactive buttons (e.g., `[Verify Payment]`, `[Review Limit]`), letting accountants or sales reps act directly from their mobile phones.
- **Staff Duty Alerting**: Telegram bots push to shared department channels (e.g., `#finance-alerts`, `#sales-pipeline-alerts`), allowing the first online staff member to claim the task.

### 5.5 Critical Milestone Escalation Matrix

If alerts remain unread or unresolved, the system enforces a strict time-based escalation tree:

| B2B Milestone                                    | T = 0 (Instant)                                                                                | T = 2 Hours (Unresolved)                                                        | T = 12 Hours (Unresolved)                                                          | T = 24 Hours (Unresolved / Critical)                                                                |
| :----------------------------------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **1. B2B Trade Credit Pending Approval**         | Send Zalo ZNS to `dealer_approver` & notify assigned `sales_representative` via Telegram Bot.  | Resend Zalo ZNS. Alert Sales Manager on Telegram.                               | Direct business email to Dealer. CRM Dashboard flags record in yellow.             | Auto-hold/cancel order session to release vehicle inventory. Brandname SMS alert to Sales Director. |
| **2. Manual Bank Transfer Pending Accountant**   | Push CRM Toast. Post transaction details to Telegram `#finance-alerts` group.                  | Direct Telegram DM to primary `accountant`. Slack alert to Lead Accountant.     | Flag CRM dashboard in flashing red. High-priority email to Finance Director.       | Direct Brandname SMS alert to CFO and `super_admin`. Block warehouse shipping releases.             |
| **3. Webhook Matching Mismatch / Security Hold** | Log headers, place order on `SUSPICIOUS_PAYMENT_HOLD`, post alert to Slack `#devops-security`. | Direct Telegram warning and SMS to On-duty DevOps Engineer and Lead Accountant. | Direct Telegram alert to CFO and CTO. Auto-lock user account's checkout interface. | Send detailed forensic report to executives and `super_admin`.                                      |

---

## 6. Verification and Security Constraints

- **Role Authorization**: Access to `apps/admin` is restricted to internal staff: `["super_admin", "sales_representative", "accountant", "warehouse_manager"].includes(user.role)`.
- **Server-Side Action Authorization (RBAC)**: All sensitive actions modifying credit limits, current debt, or manual payment verifications MUST execute a shared helper `assertRole(["super_admin", "accountant"])` inside the server action to verify permissions against the latest database state (never trusting stale session JWTs).
- **Signature Verification**: The PayOS webhook API MUST verify the signature using the configured PayOS checksum key to prevent payment spoofing.
- **Role Migration**: A migration script MUST be executed to safely transition existing `admin` roles in the DB to `super_admin` and `customer` roles to `customer`.
- **Input Isolation**: All financial updates (adjusting credit limits, debt balances) MUST be performed by authorized roles (`super_admin` or `accountant`) and validated server-side.

---

## 7. Appendix: Comparative Analysis & Technology Choice

To automate VietQR bank transfers with webhook matching, we compared PayOS against its main alternatives in Vietnam (SePay, Casso, and traditional payment gateways like VNPAY):

### Comparison Table

| Criteria              | **PayOS** (Chosen)                                                 | **SePay**                                                   | **VNPAY / Gateway**                                         |
| --------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------- |
| **Pricing Model**     | **0% Transaction Fee** (Free tier for open banking)                | Monthly subscription fee + transaction cap.                 | Percentage fee (1% - 2.5% per txn).                         |
| **B2B Margin Impact** | **0 VNĐ** extra cost for high-ticket sales.                        | Negligible but fixed cost per month/transaction.            | Prohibitive (e.g., 1.5% fee on a 100M VNĐ cọc is 300K VNĐ). |
| **Fund Holding**      | Instant Napas 24/7 direct to bank account.                         | Instant Napas 24/7 direct to bank account.                  | Holds funds for 1-2 business days.                          |
| **Integration**       | Formal Node.js SDK and clean JSON webhook signature (HMAC-SHA256). | API endpoints, app integration, Telegram alerts.            | Complex XML/JSON API, strict enterprise onboarding.         |
| **Primary Focus**     | Online e-commerce links, dynamic QR billing page.                  | Multi-channel retail (F&B), POS loa, Slack/Telegram alerts. | Retail card/e-wallet checkout.                              |

### Rationale for Choosing PayOS

1. **Zero Financial Overhead**: For B2B transactions with very high values, payOS’s 0% transaction fee via direct bank transfer avoids thousands of dollars in fee leaks annually.
2. **Superior Developer Experience**: Offers a robust, lightweight TypeScript SDK that fits perfectly with our Next.js 16/React 19 monorepo architecture.
3. **Optimized for E-Commerce Checkout**: PayOS provides a polished checkout redirection page which makes the B2C/B2B dynamic QR scanner flow seamless, whereas SePay is more optimized for physical retail POS/loa setups.
