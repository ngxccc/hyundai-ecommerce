# Evaluation of Real-Time & Offline Alerting Technologies
**Date**: 2026-06-15  
**Author**: CostController (Product Stack & Operations Cost Controller)  
**Context**: Monorepo stack using Bun, Next.js 16 (App Router), PostgreSQL with Drizzle ORM, deploying B2B Checkout and CRM quote negotiation for the Vietnamese industrial equipment market.

---

## 1. Financial Cost Comparison (VNĐ / USD)

All conversions are calculated using the exchange rate of **1 USD = 25,000 VNĐ** (exclusive of 10% VAT).

### A. Customer Alert & Transaction Channels

| Channel | Unit Cost (VNĐ) | Unit Cost (USD) | Fixed & Recurring Setup Costs | Target Use Cases |
| :--- | :--- | :--- | :--- | :--- |
| **Zalo ZNS** (OTP / Payments) | 300 VNĐ / msg | $0.012 / msg | Verified Zalo OA (golden tick):<br>• Trial: 55,000 VNĐ/mo ($2.20)<br>• Premium: 396,000 VNĐ/mo ($15.84) | Critical OTP, payment verification, order receipt. |
| **Zalo ZNS** (CSKH / Order updates) | 200 VNĐ / msg | $0.008 / msg | *Same as above.*<br>Action buttons: +100 to +700 VNĐ<br>Images: +200 VNĐ | Order confirmation, shipping updates, status change. |
| **SMS Brandname** (E-commerce CSKH) | 500 – 550 VNĐ / SMS | $0.020 – $0.022 | • Setup fee: ~1M VNĐ ($40.00) once<br>• Carrier fee: 50k - 200k VNĐ/mo per network (~250k - 1M VNĐ/mo total) | Fallback customer alerts when internet is unavailable. |
| **SMS Brandname** (OTP / Bank-tier) | 700 – 850 VNĐ / SMS | $0.028 – $0.034 | *Same as above.* | Secure banking or high-value OTP fallback. |
| **Email (Resend)** | 0 VNĐ (first 3k/mo)<br>500 VNĐ/1,000 over (Pro) | Free (first 3k/mo)<br>$0.020/1,000 over | • Free Tier: 3,000 emails/mo<br>• Pro: $20.00/mo (50,000 emails) | Invoices, quotes, transaction logs, marketing/onboarding. |
| **Email (Amazon SES)** | 2.5 VNĐ / 1,000 emails | $0.10 / 1,000 emails | • Free Tier: 62k emails/mo (from EC2)<br>• Dedicated IP: $24.95/mo (optional) | High-volume transactional logs and notifications. |

### B. Real-Time Push Channels (Staff & CRM Dashboard)

| Channel | Max Connections | Daily Message Limit | Monthly Price (USD) | Monthly Price (VNĐ) |
| :--- | :--- | :--- | :--- | :--- |
| **Pusher Sandbox (Free)** | 100 concurrent | 200,000 / day | $0.00 / mo | 0 VNĐ |
| **Pusher Startup** | 500 concurrent | 1,000,000 / day | $49.00 / mo | 1,225,000 VNĐ |
| **Ably Free** | 200 concurrent | 6,000,000 / mo | $0.00 / mo | 0 VNĐ |
| **Ably Pay-As-You-Go** | Custom | Custom | $25.00 base + usage | 625,000 VNĐ + usage |
| **Self-Hosted WebSockets** (Soketi/Bun on local VPS) | 10,000+ concurrent | Unlimited (bandwidth bound) | ~$4.00 - $6.00 / mo | 100,000 - 150,000 VNĐ |

### C. Internal / Operations Alert Channels

| Channel | Pricing | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Telegram Bot API** | **100% Free** (unlimited messages) | Instant delivery, easy API setup, no business verification required. | Reaches only Telegram users; not suitable for consumer marketing. |
| **Slack Webhooks** | **100% Free** (within workspace limits) | Deep integration with workspace, notification threading. | Subject to rate limits (1 message/sec); setup overhead. |

---

## 2. MVP Development Velocity vs. Infrastructure Operational Costs

A critical tradeoff during the MVP launch is choosing between managed SaaS services (maximizing speed) and self-hosted/raw infrastructure (minimizing operational bills).

### Scenario A: Maximizing Velocity (Managed SaaS)
*   **Tech Stack**: Resend (Emails) + Pusher (Real-Time CRM alerts) + Telegram Bot (Internal CRM alerting).
*   **Implementation Time**: **< 1 Day**. Integration requires installing official SDKs or using simple HTTP POST requests. No server infrastructure to provision, secure, or monitor.
*   **Initial Cost**: **$0.00 / month** (leveraging Free Tiers: Resend up to 3,000 emails/mo, Pusher up to 100 concurrent connections, Telegram API is free).
*   **Scaling Cost (10,000 active quotes/mo)**: **~$69.00 / month** (Pusher Startup $49 + Resend Pro $20).
*   **Maintenance Overhead**: **Near Zero**. Deliverability, SSL certificates, socket reconnection, scaling, and redundancy are completely managed.

### Scenario B: Minimizing Infrastructure Bill (Self-Hosted/Raw Infrastructure)
*   **Tech Stack**: Amazon SES (Emails) + Self-hosted Soketi/Bun WebSockets (Real-Time CRM alerts) on a cheap VPS + Telegram Bot.
*   **Implementation Time**: **3 – 5 Days**. Requires Docker configuration, setting up a reverse proxy (Nginx) for SSL certificate renewals (Let's Encrypt), tuning server limits, and dealing with AWS SES sandbox limits and reputation setup.
*   **Initial Cost**: **~$4.00 – $6.00 / month** (local VPS subscription like Vietnix or international VPS like Hetzner CX22).
*   **Scaling Cost (10,000 active quotes/mo)**: **~$5.00 / month** (VPS cost remains fixed; SES costs ~$0.50).
*   **Maintenance Overhead**: **High**. The development team must monitor VPS uptime, RAM usage, WebSocket process crashes, SSL expirations, and AWS SES reputation pools.

### Recommendation for MVP
Use **Scenario A (Managed SaaS) inside their Free Tiers**. The $0/month entry point matches the cost of Scenario B, while yielding **zero infrastructure maintenance overhead** and enabling instant MVP deployment. Transition to Amazon SES and local WebSockets only when monthly volumes exceed Free Tiers and justify the engineering maintenance tax.

---

## 3. Database Polling / Local Memory vs. Dedicated Message Queues

To guarantee that checkout payments and quote requests are never lost due to offline states or network dropouts, we need an asynchronous queue mechanism.

```text
               DATABASE TRANSACTION (Atomic write)
┌──────────────────────────────────────────────────────────────────┐
│  INSERT INTO order/quote table  │  INSERT INTO outbox_event      │
└─────────────────────────────────┴────────────────────────────────┘
                                                  │
                                          (Pending status)
                                                  ▼
                               ┌──────────────────────────────────┐
                               │     outbox_event table (Postgres)│
                               └──────────────────────────────────┘
                                                  │
                                          (1-Min Cron Poller)
                                                  ▼
                               ┌──────────────────────────────────┐
                               │    Bun Cron Worker / Serverless   │
                               └──────────────────────────────────┘
                                                  │
                                          (Process & Send)
                                                  ▼
                               ┌──────────────────────────────────┐
                               │  External API (Resend / Telegram)│
                               └──────────────────────────────────┘
```

### A. Local In-Memory Queue (e.g., in-memory array, BullMQ with local Redis)
*   **Feasibility**: **Low**. Next.js 16 App Router Server Actions and API Routes are stateless. If deployed in a Serverless environment (like Vercel) or autoscaled Docker containers, memory is ephemeral. If a container recycles or scale-down occurs, pending notifications are permanently lost.
*   **Decision**: **Avoid** for critical payment/order events.

### B. Database Polling (Transactional Outbox Pattern)
We already have the `outbox_event` schema defined in `packages/database/src/schemas/outbox-event.schema.ts`. This table stores the event payload and status (`PENDING`, `PROCESSED`, `FAILED`).
*   **Feasibility**: **High**. During checkout or quote creation, write the domain record and the `outbox_event` record inside the same database transaction.
    ```typescript
    await db.transaction(async (tx) => {
      await tx.insert(orders).values(newOrderData);
      await tx.insert(outboxEvents).values({
        eventType: "SEND_QUOTE_EMAIL",
        payload: { orderId: newOrderData.id, customerEmail: email },
        status: "PENDING"
      });
    });
    ```
*   **Polling Implementation**:
    - **Serverless (Vercel)**: Run a Vercel Cron Job targeting `/api/cron/process-outbox` every 1 minute.
    - **Serverful (Bun)**: Run a native background loop/worker that queries the DB for `PENDING` records every 10 seconds:
      ```typescript
      // Fetch and lock records to prevent race conditions during scaling
      const pendingEvents = await db
        .select()
        .from(outboxEvents)
        .where(eq(outboxEvents.status, "PENDING"))
        .limit(10)
        .for("update", { skipLocked: true }); // Avoid duplicate processing
      ```
*   **Pros**: 
    - **At-Least-Once Delivery**: No event is lost even if the external notification API (Resend/ZNS) goes down.
    - **Zero Infra Cost**: Uses the existing PostgreSQL database.
*   **Cons**: Introduces database query load (minimized by indexes on `status` and `createdAt`).

### C. Dedicated Message Queues (RabbitMQ, AWS SQS)
*   **Feasibility**: **High, but premature**. Introduces extra hosting costs (e.g., Upstash Redis cloud instances, SQS message fees) and configuration complexity.
*   **Decision**: Defer until transaction volume exceeds 50 orders/minute.

### Recommendation
Implement the **Transactional Outbox Pattern** using the existing PostgreSQL schema and a database poller. This guarantees 100% data integrity for checkout payments and quotes at **zero extra infrastructure cost**.

---

## 4. Checklist for MVP Launch (Zero Cost, Zero Missed Alerts)

To ensure zero missed payments or critical orders while keeping operational costs at exactly **$0.00/month** at launch:

### Phase 1: Setup & Integrations
- [ ] **Create a Telegram Channel for internal operations alerts**:
  - Set up a free Telegram Bot using BotFather.
  - Obtain the `chat_id` for the team channel and save the bot token in Doppler secrets (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`).
- [ ] **Configure Resend Free Account**:
  - Verify the business domain on Resend (SPF, DKIM, DMARC records in DNS).
  - Add `RESEND_API_KEY` to Doppler. Keep initial volume under 3,000 emails/month (100/day).
- [ ] **Disable expensive channels in code configuration**:
  - Keep SMS Brandname and Zalo ZNS modules deactivated or mock them. Use transactional emails as the customer-facing alert fallback.

### Phase 2: Transactional Integrity
- [ ] **Wrap Checkout/Quote Actions in Transactions**:
  - Ensure every user checkout write or quote request write writes an `outbox_event` inside a Drizzle `db.transaction()` block.
- [ ] **Implement Outbox Poller API Route**:
  - Create `/apps/storefront/src/app/api/cron/process-outbox/route.ts` (secured with a secret token in headers).
  - The handler:
    1. Fetches pending events.
    2. Executes sending (Resend API for customers, Telegram Bot API for staff alerts).
    3. Updates status to `PROCESSED` on success, or increments `retryCount` and logs `lastError` on failure.
- [ ] **Configure Vercel / Bun Cron Job**:
  - Add a cron configuration to call the route every 1 minute.

### Phase 3: Failure & Escalation Backstop
- [ ] **Telegram Admin Escalation Alert**:
  - If an outbox event fails after 3 retries (`retryCount >= 3`), update its status to `FAILED` and trigger a direct alert to the Telegram Staff channel.
  - Format: `🚨 ALERT: Event ID {id} failed to send notification for Order {orderId} after 3 retries. Manual intervention required.`
  - This establishes a human backstop, guaranteeing zero orders are permanently missed or forgotten.
- [ ] **Test Execution**:
  - Simulate a network failure (mocking the Resend API to fail) during a test checkout.
  - Verify the event status changes to `FAILED` and the Telegram bot successfully alerts the staff channel.
