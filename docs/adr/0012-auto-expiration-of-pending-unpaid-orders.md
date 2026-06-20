# 12. Auto Expiration of Pending Unpaid Orders

Date: 2026-06-20

## Status

Accepted

## Context

In our e-commerce platform, when an order is created, the user has a limited window of time (15 minutes) to complete their payment (e.g., via PayOS or cash deposit). If they fail to pay or choose to cancel, the order remains in the database in a `PENDING` state indefinitely.
This results in several issues:

1. **Unpaid Orders Inventory Lock**: Although we do not deduct warehouse stock during checkout, the order status dictates logic around reservations, and having hanging unpaid orders makes it difficult to track actual active purchase intent.
2. **Payment and Transaction Desynchronization**: Checkout inserts both a `payment` record (the overall billing/payment intent) and a `payment_transaction` record (the individual transaction attempt). If the order is abandoned, these records stay `PENDING` forever.
3. **Database Bloat**: Leaving thousands of abandoned orders in `PENDING` state clutters order listings and reports.

To resolve this, we need a reliable, serverless-friendly mechanism to auto-expire unpaid orders after 15 minutes.

## Decision

We decide to implement an order auto-expiration flow with the following architecture:

1. **Database & Service Layer (OrderService)**:
   - Add `expirePendingOrders(expirationWindowMinutes)` to `OrderService`.
   - In `DbOrderService`, implement a transaction that:
     - Queries all orders with `status = 'PENDING'`, `paymentStatus = 'UNPAID'`, and `createdAt < now - 15 minutes`.
     - Updates their status to `CANCELLED`.
     - Updates associated `payment` records with status `PENDING` to `FAILED`.
     - Updates associated `payment_transaction` records with status `PENDING` to `FAILED`.
     - Uses Drizzle's `inArray` helper for clean and safe bulk updates.
   - Separate the database schemas (`orders`, `payments`, `paymentTransactions`) but keep them connected logically through `orderId`. This star schema simplifies querying from the `orders` aggregate root and avoids deep nested joins.

2. **Next.js API Route**:
   - Create `/api/cron/expire-orders` using the Next.js App Router.
   - Protect this route using an `Authorization` Bearer token matching `CRON_SECRET` from the environment variables.
   - To prevent `HANGING_PROMISE_REJECTION` during static prerendering, call `await connection()` at the very beginning of the route handler, before the `try/catch` block. This informs Next.js immediately to treat this as a dynamic route and opt out of static generation.

3. **External Cron Webhook**:
   - Set up an external cron scheduler (e.g., Vercel Cron or Upstash QStash) to call `POST /api/cron/expire-orders` every 5 minutes.

## Consequences

- **Positive**:
  - Abandoned orders and their payment intents are cleaned up automatically.
  - Consistent audit trail showing transactions that failed to complete.
  - Safe Next.js build compilation with no static prerendering errors.
- **Negative**:
  - Relies on an external scheduler to trigger the HTTP endpoint.
  - Requires maintaining a secure `CRON_SECRET` environment variable.

### Explicit Tradeoffs

- **Security vs. Simplicity**: Instead of building complex message queues or database-level cron triggers (like `pg_cron`), we chose an API route secured by a shared `CRON_SECRET` token. This keeps the logic in the TypeScript service layer (making it testable and maintainable) while securing it against unauthorized execution.
  We split payment management into two tables: `payments` (the overall payment intent/status per order) and `payment_transactions` (the individual attempts/chunks). This separation is necessary because:
  - _B2B Multi-step Payments (Deposit & Remainder)_: A single order (one overall `payment` record) can have multiple transaction attempts (e.g., 20% deposit transaction and 80% remainder transaction). A single table cannot represent this one-to-many relationship without duplicating order total and method configurations.
  - _Retry & Audit Trail_: If a user's transaction fails (e.g. timeout on PayOS link), we record a transaction with status `FAILED`. When they retry and succeed, a new transaction with status `SUCCESS` is recorded. This preserves a complete, immutable audit trail for bank reconciliation without losing metadata or overwriting historic states.
  - _Idempotency & Webhook Reconciliation_: Webhooks from payment gateways return technical codes (like `referenceCode` or `orderCode`). We update the corresponding `payment_transaction` based on this code first, and then re-calculate the order's payment status, decoupling payment gateway specific logic from overall billing rules.

- **Star Schema (Direct References to Orders) vs. Hierarchical Schema**:
  Both `payments` and `payment_transactions` reference `orders.id` directly rather than chaining them (`orders` -> `payments` -> `payment_transactions`). This decision is based on:
  - _Order as the Aggregate Root_: Since all payment data exists for an order, direct references allow simple and fast queries from the order root using Drizzle's relational query builder (e.g., loading both payments and transactions in one simple `findFirst` query) without performing nested JOINs.
  - _Webhook Performance Optimization_: Payment gateway webhooks only contain the `orderId` or `orderCode` and do not have access to our internal `paymentId`. Referencing `orderId` directly allows the webhook handler to insert or update the transaction immediately in a single query, bypassing an intermediate SELECT query to find `paymentId`.
  - _Split Payment Flexibility_: A single order paid via multiple methods (e.g. partial PayOS and partial Cash) will have two distinct `payments` records, but all transaction logs can simply reference `orderId` to roll up total amounts.
