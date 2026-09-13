# 8. Decoupling B2B Quotation Lifecycle from Legacy Retail Order Flow

Date: 2026-09-13

## Status

Accepted

## Context

The initial architectural design of `OrdersModule` (`backend/src/modules/orders/`) was derived from a conventional retail B2C shopping platform:

1. Anonymous guest checkout deducting inventory immediately upon web form submission (`POST /api/v1/orders/checkout`).
2. Parcel delivery state machine (`PENDING` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`).
3. Scheduled 15-minute automated cancellation cron for unpaid checkout sessions (`POST /api/v1/orders/cron/expire`).
4. Public order cancellation endpoint without administrative role gating (`POST /api/v1/orders/:id/cancel`).

In the actual B2B industrial machinery domain (commercial generators, industrial water pumps, agricultural machinery), this retail paradigm conflicted with commercial reality:

1. **Commercial Finality in Quotation**: The negotiation lifecycle culminates when sales engineers and corporate procurement negotiate custom pricing, delivery terms, and payment schedules, transitioning the quote to `APPROVED` status with dual-format commercial proposals (Bản Báo Giá Doanh Nghiệp in PDF/Excel).
2. **Contract-Driven Fulfillment**: B2B machinery orders represent long-term procurement contracts rather than impulsive parcel deliveries. Machine delivery involves crane logistics, on-site commissioning, and staged corporate wire transfers (e.g. 30% advance deposit, 70% post-delivery commissioning).
3. **Absence of Retail Customer Tracking**: Storefront has no consumer order tracking page (`/orders`); all customer journeys originate from product discovery and culminate in Request for Quotation (`/quote`).

Attempting to force B2B quotation approvals into retail order pipelines without defined operational boundaries created architectural ambiguity and bloated public APIs with dormant retail endpoints.

---

## Decision

We establish an explicit architectural boundary decoupling the **B2B Quotation Lifecycle** from downstream **Order Fulfillment**:

### 1. Quotation as the Autonomous Commercial Engine

- `QuotesModule` manages the complete B2B negotiation lifecycle through a self-consistent finite state machine (`DRAFT -> SUBMITTED -> NEGOTIATING -> APPROVED | REJECTED | EXPIRED`).
- Direct status transitions to `APPROVED` via `PATCH /api/v1/quotes/:id/status` operate autonomously without mandatory downstream order generation, allowing quotes to serve as self-contained legal proposals.

### 2. Confirmed Order as Downstream Commercial Contract

- Downstream order creation is triggered explicitly when administrative staff approve and execute the commercial contract via `POST /api/v1/quotes/:id/approve-to-order` or manual backoffice order creation (`POST /api/v1/orders/admin`).
- The resulting record in `orders` represents a **Confirmed Commercial Contract**:
  - Inherits negotiated unit prices, customer entity ID, shipping address, and line items from the quotation.
  - Links bidirectionally via `quotes.orderId`.
  - Admin CMS redirects sales personnel directly from the quotation header to the generated order cockpit (`/orders/{orderId}`) for delivery tracking and payment settlement.

### 3. Deprecation and Gating of Retail Endpoints

- **Guest Retail Checkout (`POST /api/v1/orders/checkout`)**:
  - Marked `@deprecated` on OpenAPI/Swagger.
  - Documented as a legacy B2C endpoint. The storefront maintains zero routes or buttons calling checkout.
- **Auto-Expiration Cron (`POST /api/v1/orders/cron/expire`)**:
  - Marked `@deprecated` on OpenAPI/Swagger.
  - High-value machinery procurement operates on corporate bank transfers with multi-day authorization windows, rendering 15-minute auto-cancellation obsolete.
- **Order Cancellation (`POST /api/v1/orders/:id/cancel`)**:
  - Gated strictly with `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles("ADMIN")`.
  - Prevents public or unauthorized cancellation of legally binding corporate procurement orders.

### 4. Co-Location of Offline Payment Verification

- Offline cash and corporate bank transfer verification is co-located directly in `OrdersModule` (`POST /api/v1/orders/:id/verify-cash`).
- Admin CMS (`order.actions.ts`) interacts directly with `ordersApi.verifyCash`, permanently decoupling order management from legacy instant payment gateways (`PaymentsModule`).

---

## Consequences & Trade-offs

### Positive

- **Architectural Clarity**: Clear separation between pre-contract negotiation (`QuotesModule`) and post-contract fulfillment (`OrdersModule`).
- **Security Posture**: Public attack surface minimized by gating order cancellation and deprecating anonymous retail checkout.
- **Developer Experience**: Eliminates confusion between B2C consumer shopping carts and B2B corporate RFQ workflows.
- **Contract Integrity**: OpenAPI specification and TypeScript definitions accurately reflect the active B2B business domain.

### Negative & Mitigations

- **Legacy Code Retention**: Dormant checkout methods remain in `orders.service.ts` to support legacy test suites.
  - _Mitigation_: Explicit OpenAPI `@deprecated` annotations and JSDoc architectural warnings deter new consumers. Complete code deletion is scheduled for post-migration deprecation cycle.
