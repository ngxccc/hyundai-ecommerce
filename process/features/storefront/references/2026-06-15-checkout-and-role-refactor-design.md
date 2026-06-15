# Design Specification: B2B Checkout Flow & User Roles Refactor

**Date**: 2026-06-15  
**Author**: Antigravity (Advanced Agentic Coding Agent)  
**Status**: Approved (User-confirmed & Multi-Agent Predict-Reviewed)

---

## 1. Context and Goals

This design specification details the implementation of a high-performance B2B checkout and order payment flow for the Hyundai E-Commerce platform. It also replaces the generic `admin` role with semantic internal company roles to support a multi-user corporate workflow.

### Goals
* Integrate **PayOS** for 0%-fee automatic VietQR payment matching.
* Support **B2B Trade Credit (Net Terms)** for authorized Dealers, Contractors, and Distributors to check out using credit limits.
* Refactor database roles to support distinct business personas: `super_admin`, `sales_representative`, `accountant`, `warehouse_manager`, `dealer_approver`, `dealer_purchaser`, and `customer`.
* Support split payments (20% deposit online, 80% remainder online or offline) and manual bank transfer fallback.
* Ensure strict transaction safety (idempotency, pessimistic locking, raw body webhook validation, and clear audit logging).
* Implement a robust, real-time notification and offline alerting system to handle immediate payment matching notifications, credit approvals, and on-duty escalation.

---

## 2. Refactored User Roles

The database `user_role` enumeration is refactored from `admin, dealer, customer` to:

| Role Name | Scope | Permissions |
|-----------|-------|-------------|
| `super_admin` | Internal | Full system administration, database configuration, and system-wide overrides. |
| `sales_representative` | Internal | Manage quote requests, negotiate prices with dealers, view deals pipeline. |
| `accountant` | Internal | Review payments, verify manual bank transfers, approve/set credit limits, view billing. |
| `warehouse_manager` | Internal | Manage stock levels, view orders ready for shipment, log shipments. |
| `dealer_approver` | External | B2B account owner/approver. Has authority to approve trade credit usage and place orders. |
| `dealer_purchaser` | External | B2B purchasing staff. Can build carts and initiate checkouts, but needs approval. |
| `customer` | External | Standard retail buyer. Instant/deposit payment via gateway or bank transfer. |

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
* `creditLimit`: `numeric(12, 2)` (Default: `0.00`) - The maximum approved trade credit for B2B accounts.
* `currentDebt`: `numeric(12, 2)` (Default: `0.00`) - The outstanding debt balance of the customer.

#### 2. Orders Table (`order`)
* `paymentMethod`: `enum('GATEWAY', 'BANK_TRANSFER', 'TRADE_CREDIT')`
* `paymentStatus`: `enum('UNPAID', 'DEPOSIT_PAID', 'FULLY_PAID', 'PENDING_VERIFICATION')`
* `approvalStatus`: `enum('APPROVED', 'PENDING_APPROVAL')` (Default: `'APPROVED'` for retail/approver, `'PENDING_APPROVAL'` for purchaser)

#### 3. Payment Transactions Table (`payment_transaction` - New Table)
Tracks detailed payment milestones for order deposits and remainder settlements.
* `id`: `uuid().primaryKey()`
* `orderId`: `uuid().references(() => orders.id)`
* `amount`: `numeric(12, 2).notNull()`
* `paymentMethod`: `text().notNull()` (e.g., `'PAYOS'`, `'MANUAL_TRANSFER'`)
* `transactionType`: `enum('DEPOSIT', 'REMAINDER', 'FULL')`
* `status`: `enum('PENDING', 'SUCCESS', 'FAILED')`
* `referenceCode`: `text().unique().notNull()` (Transaction ID from PayOS/Bank matching to enforce idempotency)
* `verifiedBy`: `uuid().references(() => users.id)` (Accountant ID if approved manually)
* `createdAt`: `timestamp().defaultNow()`

#### 4. Credit Limit History Table (`credit_limit_history` - New Table)
Provides audit logs for all credit limit updates for compliance.
* `id`: `uuid().primaryKey()`
* `userId`: `uuid().references(() => users.id)` (The B2B account)
* `oldLimit`: `numeric(12, 2).notNull()`
* `newLimit`: `numeric(12, 2).notNull()`
* `changedBy`: `uuid().references(() => users.id)` (The accountant or admin who performed the change)
* `reason`: `text()`
* `createdAt`: `timestamp().defaultNow()`

---

## 4. Payment Flows & Webhook Integration

### Flow A: Automatic VietQR payment via PayOS
* When selecting QR payment, the system invokes PayOS API to generate a dynamic link.
* The link renders a QR code with Hyundai's bank details, the exact 20% deposit or 100% total, and a unique reference code.
* **Webhook Signature Verification (Raw Body)**:
  - The webhook handler MUST parse the **raw request body string** (not the parsed JSON) to calculate the HMAC-SHA256 checksum and verify against the header signature.
  - The signature verification MUST use a constant-time string comparison (`crypto.timingSafeEqual`) to eliminate timing attacks.
* **Webhook Idempotency & Processing**:
  1. PayOS fires a Webhook to `/api/payments/payos-webhook`.
  2. The webhook handler opens a database transaction and checks if `referenceCode` already exists in `payment_transaction`.
  3. If it exists, returns `208 Already Reported` or `200 OK` immediately to gracefully ignore duplicate webhook deliveries.
  4. If new, updates `paymentStatus` to `DEPOSIT_PAID` or `FULLY_PAID`, inserts the transaction, and writes any heavy background tasks (email notifications, PDF invoices) to the `outbox_event` table inside the *same* database transaction to ensure atomicity.
  5. Returns `200 OK` (under 2 seconds).
* **UI Synchronization & Polling**:
  - The storefront checkout page uses short polling (checking order payment status every 5 seconds) for up to 10 minutes (to allow for Maker-Checker B2B approvals).
  - The payment details, dynamic QR code, and checkout instructions remain visible, and a "Keep Waiting" prompt is offered when approaching the timeout.
* **Re-verify Payment Option**:
  - The checkout timeout screen and the customer portal order detail page display a "Re-verify Payment" button when the order's payment status is `PENDING_VERIFICATION`.
  - Clicking this triggers a server-side API call to PayOS to fetch the transaction status and update the database immediately, resolving stuck payment states.
  - Rate limiting is enforced: the button is disabled for 30 seconds after a click (showing a countdown timer) and server-side rate limits are applied.

### Flow B: B2B Trade Credit (Net Terms) & Pessimistic Locking
* Available only to roles `dealer_approver` / `dealer_purchaser` / business types with approved `creditLimit`.
* **Submit for Approval Flow**:
  - If checkout is initiated by a `dealer_purchaser`, the order total is calculated but instead of executing Trade Credit immediately, the order is created with `approvalStatus = 'PENDING_APPROVAL'`. The `dealer_approver` is notified to review and release the order.
* **Order Checkout Execution**:
  1. System recalculates the order total server-side by querying the database product catalog prices (never trusting client-submitted pricing fields).
  2. The system opens a database transaction and applies a pessimistic lock (`SELECT FOR UPDATE`) on the target `user` row.
  3. **Lock Constraint**: No external HTTP calls (such as PayOS or third-party APIs) are allowed inside the transaction holding the lock. The transaction block must be kept under 50ms.
  4. If `creditLimit - currentDebt >= recalculatedTotal`:
     - Creates order with `paymentMethod = 'TRADE_CREDIT'` and `paymentStatus = 'UNPAID'`.
     - Increments `currentDebt` by the order total in the locked row.
     - Generates a Net 30/60 invoice.
     - Commits transaction. If concurrently modified, it rolls back or waits.
* Once offline payment is made, `accountant` logs the payment on CRM, reducing `currentDebt`.

### Flow C: Manual Bank Transfer Fallback
* System displays company bank account details + instructions.
* Order marked `PENDING_VERIFICATION`.
* Accountant verifies incoming funds and manually approves the payment.

### Flow D: Refunds & Order Cancellation Constraints
* **Insecure Direct Object Reference (IDOR) Protection**:
  - The cancellation and detail APIs must perform ownership verification: verifying that the order's `userId` matches the authenticated session's `userId`.
* **Trade Credit cancellation**:
  - B2B users are only allowed to self-cancel orders using Trade Credit if the order status is still `pending`.
  - Once the order transitions to `processing`, `shipped`, or `delivered`, the self-cancel option is disabled on the storefront and replaced by a **"Request Cancellation"** action.
  - Clicking "Request Cancellation" opens a modal explaining the hold, updates the order to `CANCELLATION_REQUESTED`, and routes a high-priority approval task to the assigned `sales_representative` in the Admin CRM.
  - When successfully cancelled and approved, the system automatically reduces `currentDebt` by the order total.
* **Online Gateway refunds**: If a PayOS order is cancelled, the order changes status to `REFUND_PENDING`. The Accountant reviews the refund request and manually processes the transfer via bank account, then updates the system status.

---

## 5. Real-Time Notification & Offline Alerting Architecture

To guarantee low latency, robust data delivery, and zero missed critical alerts, the system integrates a real-time notification engine with offline fallback capabilities.

### 5.1 Real-Time Subscription Stack (MVP vs. Scale)
* **MVP Strategy**: Use a managed WebSocket platform like **Pusher / Ably** inside their free tiers (up to 100-200 concurrent connections, $0/month). It eliminates setup complexity (SSL certificates, horizontal socket routing, clustering) and handles auto-reconnections natively.
* **Long-Term Scaling Strategy**: Migrate to a self-hosted stateful **Bun WebSocket server (or Soketi)** running inside Docker containers on local cloud providers (e.g., Viettel IDC or Vietnix). A clustered Bun server backed by a **Redis Pub/Sub** backplane costs ~$5/month while comfortably handling 100k+ concurrent idle connections.
* **Subscription Authentication**: All client subscriptions to private user channels (e.g., `private-user-user_uuid`) must authenticate using an HMAC-SHA256 token signed by the server's private key to prevent tenant data sniffing.

### 5.2 Transactional Outbox Pattern for Alerts
To prevent database connection pool saturation, publishing notifications is decoupled from database transactions.
1. When a business event happens (such as a payment webhook or quote submission), the transaction block writes the main tables and inserts a notification request in the `outbox_event` table.
2. A background cron worker (running every 10 seconds under Bun or 1 minute under Vercel Serverless) queries `PENDING` events using a fail-safe optimistic query (`SELECT ... FOR UPDATE SKIP LOCKED`).
3. The worker dispatches notifications to the target channel (WebSockets/Pusher if online, or fallback channels if offline) and updates the status to `PROCESSED`.

### 5.3 Connection Heartbeat Presence
The platform checks user connectivity before routing messages to save costs on external SMS/Zalo.
* **Redis Heartbeat**: When clients connect, the server registers a key `presence:user:<userId>` with a 30-second TTL. The client browser pings every 15 seconds.
* **Offline Detection**: If the presence key is missing when an alert is fired, the fallback offline routing engine is activated instantly.

### 5.4 Offline Local Fallback Channels (Vietnam Context)
When dealers or staff members are offline, notifications are automatically routed to local communication tools:

#### A. External Dealers: Zalo Notification Service (ZNS) & SMS
* **Primary Channel**: **Zalo ZNS** is the primary B2B customer update channel in Vietnam due to high adoption and low cost (~200 - 300 VNĐ per transactional message, free on failed delivery). It allows interactive call-to-action buttons (redirection to payment or order history).
* **Setup**: Requires a verified Zalo Official Account (OA) and pre-approval of message templates by VNG.
* **Secondary Channel (SMS Brandname)**: Used as a backup for users without a Zalo account. Cost is higher (~500 - 850 VNĐ per message) and content is restricted to plain text.

#### B. Internal Staff & CRM Alerts: Telegram / Slack Bots
* **Primary Channel**: **Telegram & Slack Bots** are used for internal CRM notifications. They are **100% free** and support inline interactive buttons (e.g., `[Verify Payment]`, `[Review Limit]`), letting accountants or sales reps act directly from their mobile phones.
* **Staff Duty Alerting**: Telegram bots push to shared department channels (e.g., `#finance-alerts`, `#sales-pipeline-alerts`), allowing the first online staff member to claim the task.

### 5.5 Critical Milestone Escalation Matrix
If alerts remain unread or unresolved, the system enforces a strict time-based escalation tree:

| B2B Milestone | T = 0 (Instant) | T = 2 Hours (Unresolved) | T = 12 Hours (Unresolved) | T = 24 Hours (Unresolved / Critical) |
| :--- | :--- | :--- | :--- | :--- |
| **1. B2B Trade Credit Pending Approval** | Send Zalo ZNS to `dealer_approver` & notify assigned `sales_representative` via Telegram Bot. | Resend Zalo ZNS. Alert Sales Manager on Telegram. | Direct business email to Dealer. CRM Dashboard flags record in yellow. | Auto-hold/cancel order session to release vehicle inventory. Brandname SMS alert to Sales Director. |
| **2. Manual Bank Transfer Pending Accountant** | Push CRM Toast. Post transaction details to Telegram `#finance-alerts` group. | Direct Telegram DM to primary `accountant`. Slack alert to Lead Accountant. | Flag CRM dashboard in flashing red. High-priority email to Finance Director. | Direct Brandname SMS alert to CFO and `super_admin`. Block warehouse shipping releases. |
| **3. Webhook Matching Mismatch / Security Hold** | Log headers, place order on `SUSPICIOUS_PAYMENT_HOLD`, post alert to Slack `#devops-security`. | Direct Telegram warning and SMS to On-duty DevOps Engineer and Lead Accountant. | Direct Telegram alert to CFO and CTO. Auto-lock user account's checkout interface. | Send detailed forensic report to executives and `super_admin`. |

---

## 6. Verification and Security Constraints

* **Role Authorization**: Access to `apps/admin` is restricted to internal staff: `["super_admin", "sales_representative", "accountant", "warehouse_manager"].includes(user.role)`.
* **Server-Side Action Authorization (RBAC)**: All sensitive actions modifying credit limits, current debt, or manual payment verifications MUST execute a shared helper `assertRole(["super_admin", "accountant"])` inside the server action to verify permissions against the latest database state (never trusting stale session JWTs).
* **Signature Verification**: The PayOS webhook API MUST verify the signature using the configured PayOS checksum key to prevent payment spoofing.
* **Role Migration**: A migration script MUST be executed to safely transition existing `admin` roles in the DB to `super_admin` and `customer` roles to `customer`.
* **Input Isolation**: All financial updates (adjusting credit limits, debt balances) MUST be performed by authorized roles (`super_admin` or `accountant`) and validated server-side.

---

## 7. Appendix: Comparative Analysis & Technology Choice

To automate VietQR bank transfers with webhook matching, we compared PayOS against its main alternatives in Vietnam (SePay, Casso, and traditional payment gateways like VNPAY):

### Comparison Table

| Criteria | **PayOS** (Chosen) | **SePay** | **VNPAY / Gateway** |
|----------|-------------------|-----------|---------------------|
| **Pricing Model** | **0% Transaction Fee** (Free tier for open banking) | Monthly subscription fee + transaction cap. | Percentage fee (1% - 2.5% per txn). |
| **B2B Margin Impact** | **0 VNĐ** extra cost for high-ticket sales. | Negligible but fixed cost per month/transaction. | Prohibitive (e.g., 1.5% fee on a 100M VNĐ cọc is 300K VNĐ). |
| **Fund Holding** | Instant Napas 24/7 direct to bank account. | Instant Napas 24/7 direct to bank account. | Holds funds for 1-2 business days. |
| **Integration** | Formal Node.js SDK and clean JSON webhook signature (HMAC-SHA256). | API endpoints, app integration, Telegram alerts. | Complex XML/JSON API, strict enterprise onboarding. |
| **Primary Focus** | Online e-commerce links, dynamic QR billing page. | Multi-channel retail (F&B), POS loa, Slack/Telegram alerts. | Retail card/e-wallet checkout. |

### Rationale for Choosing PayOS
1. **Zero Financial Overhead**: For B2B transactions with very high values, payOS’s 0% transaction fee via direct bank transfer avoids thousands of dollars in fee leaks annually.
2. **Superior Developer Experience**: Offers a robust, lightweight TypeScript SDK that fits perfectly with our Next.js 16/React 19 monorepo architecture.
3. **Optimized for E-Commerce Checkout**: PayOS provides a polished checkout redirection page which makes the B2C/B2B dynamic QR scanner flow seamless, whereas SePay is more optimized for physical retail POS/loa setups.
