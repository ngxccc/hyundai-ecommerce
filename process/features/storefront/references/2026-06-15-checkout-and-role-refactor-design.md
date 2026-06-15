# Design Specification: B2B Checkout Flow & User Roles Refactor

**Date**: 2026-06-15
**Author**: Antigravity (Advanced Agentic Coding Agent)
**Status**: Approved (User-confirmed)

---

## 1. Context and Goals

This design specification details the implementation of a high-performance B2B checkout and order payment flow for the Hyundai E-Commerce platform. It also replaces the generic `admin` role with semantic internal company roles to support a multi-user corporate workflow.

### Goals

- Integrate **PayOS** for 0%-fee automatic VietQR payment matching.
- Support **B2B Trade Credit (Net Terms)** for authorized Dealers, Contractors, and Distributors to check out using credit limits.
- Refactor database roles to support distinct business personas: `super_admin`, `sales_representative`, `accountant`, `warehouse_manager`, `dealer`, and `customer`.
- Support split payments (20% deposit online, 80% remainder online or offline) and manual bank transfer fallback.

---

## 2. Refactored User Roles

The database `user_role` enumeration is refactored from `admin, dealer, customer` to:

| Role Name              | Scope    | Permissions                                                                                |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `super_admin`          | Internal | Full system administration and database configuration.                                     |
| `sales_representative` | Internal | Manage quote requests, negotiate prices with dealers, view deals pipeline.                 |
| `accountant`           | Internal | Review payments, verify manual bank transfers, approve/set credit limits.                  |
| `warehouse_manager`    | Internal | Manage stock levels, view orders ready for shipment, log shipments.                        |
| `dealer`               | External | Access special dealer pricing tiers, purchase against trade credit, view billing invoices. |
| `customer`             | External | Standard retail buyer. Instant/deposit payment via gateway or bank transfer.               |

---

## 3. Database Schema Extensions

### Schema Changes (`packages/database/src/schemas/auth.schema.ts`)

```typescript
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "sales_representative",
  "accountant",
  "warehouse_manager",
  "dealer",
  "customer",
]);
```

### Table Schema Updates

#### 1. Users Table (`user`)

- `creditLimit`: `numeric(12, 2)` (Default: `0.00`) - The maximum approved trade credit for B2B accounts.
- `currentDebt`: `numeric(12, 2)` (Default: `0.00`) - The outstanding debt balance of the customer.

#### 2. Orders Table (`order`)

- `paymentMethod`: `enum('GATEWAY', 'BANK_TRANSFER', 'TRADE_CREDIT')`
- `paymentStatus`: `enum('UNPAID', 'DEPOSIT_PAID', 'FULLY_PAID', 'PENDING_VERIFICATION')`

#### 3. Payment Transactions Table (`payment_transaction` - New Table)

Tracks detailed payment milestones for order deposits and remainder settlements.

- `id`: `uuid().primaryKey()`
- `orderId`: `uuid().references(() => orders.id)`
- `amount`: `numeric(12, 2).notNull()`
- `paymentMethod`: `text().notNull()` (e.g., `'PAYOS'`, `'MANUAL_TRANSFER'`)
- `transactionType`: `enum('DEPOSIT', 'REMAINDER', 'FULL')`
- `status`: `enum('PENDING', 'SUCCESS', 'FAILED')`
- `referenceCode`: `text().unique()` (Transaction ID from PayOS or bank memo)
- `verifiedBy`: `uuid().references(() => users.id)` (Accountant ID if approved manually)
- `createdAt`: `timestamp().defaultNow()`

---

## 4. Payment Flows & Webhook Integration

### Flow A: Automatic VietQR payment via PayOS

- When selecting QR payment, the system invokes PayOS API to generate a dynamic link.
- The link renders a QR code with Hyundai's bank details, the exact 20% deposit or 100% total, and a unique reference code.
- On payment completion:
  1. PayOS banks Napas 24/7 immediately to Hyundai's account.
  2. PayOS fires a Webhook to `/api/payments/payos-webhook`.
  3. The API validates the signature, finds the order by reference code, updates `paymentStatus` to `DEPOSIT_PAID` or `FULLY_PAID`, and logs the transaction.

### Flow B: B2B Trade Credit (Net Terms)

- Available only to roles `dealer` / business types with approved `creditLimit`.
- At checkout, if `creditLimit - currentDebt >= orderTotal`:
  1. System creates order with `paymentMethod = 'TRADE_CREDIT'` and `paymentStatus = 'UNPAID'`.
  2. Increments `currentDebt` by the order total.
  3. Generates a Net 30/60 invoice.
  4. Once payment is made (by bank transfer), `accountant` logs the payment on Admin CRM, reducing `currentDebt`.

### Flow C: Manual Bank Transfer Fallback

- System displays company bank account details + instructions.
- Order marked `PENDING_VERIFICATION`.
- Accountant verifies incoming funds and manually approves the payment.

---

## 5. Verification and Security Constraints

- **Role Authorization**: Access to `apps/admin` is restricted to internal staff: `["super_admin", "sales_representative", "accountant", "warehouse_manager"].includes(user.role)`.
- **Signature Verification**: The PayOS webhook API MUST verify the signature using the configured PayOS checksum key to prevent payment spoofing.
- **Credit Constraints**: Transactions using Trade Credit must perform atomic checks to prevent double-spending/exceeding credit limits.

---

## 6. Appendix: Comparative Analysis & Technology Choice

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
