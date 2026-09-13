# 4. Pivot from Retail B2C E-Commerce to B2B Industrial Machinery Quotation and Negotiation Platform

Date: 2026-09-12

## Status

Accepted

## Context

The initial prototype of the Hyundai E-Commerce platform was architected around a conventional retail B2C shopping paradigm:

1. Public shopping cart with session-based and persistent guest cart merging (`CartModule`).
2. Instant retail checkout deducting inventory immediately upon guest form submission (`OrdersModule`).
3. Payment integration with PayOS for instant retail VietQR code generation and automated webhook settlement (`PaymentsModule`).
4. Automated order delivery lifecycle (`PENDING` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`).

When transitioning to industrial machinery distribution (three-phase industrial generators, heavy agricultural machinery, high-capacity commercial water pumps), this retail B2C architecture suffered fatal business and operational friction:

1. **Transaction Magnitude & Banking Limits**:
   - Heavy machinery equipment carries price tags ranging from 50,000,000 VND to several billion VND.
   - Retail QR-code instant checkout fails outright due to daily personal banking limits, corporate multi-signatory authorization policies, and staged corporate procurement regulations.
2. **Dynamic & Non-Static Pricing Realities**:
   - Machinery pricing cannot remain static. Unit pricing varies substantially based on procurement volume, dealer tiers, delivery logistics, custom engineering specifications, and volatile raw material indexes.
   - Forcing a fixed "Buy Now" price either undercuts enterprise margins or discourages large corporate inquiries.
3. **Enterprise Legal & Accounting Requirements**:
   - Corporate buyers require formal, stamped commercial proposals (Bản Báo Giá Doanh Nghiệp) with tax ID, corporate bank details, and formal warranty commitments prior to issuing purchase orders.
   - Accounting departments require structured, formula-backed Excel spreadsheets (`.xlsx`) adhering to standard accounting layouts, complete with amount-in-words in Vietnamese ("Bằng chữ").

---

## Decision

We pivot the core business domain of the platform from a retail B2C e-commerce shop to a **B2B Industrial Machinery Quotation, Negotiation, and Distribution System**:

### 1. Storefront as a Pure B2B RFQ Portal

- The Storefront (`storefront/`) is refactored into a high-performance product showcase and Request for Quotation (RFQ) capture portal.
- All shopping cart, instant checkout, and PayOS payment UI paths are completely eliminated.
- Customers browse equipment, select desired items, and submit an RFQ with corporate credentials (Company Name, Tax ID, Representative Name, Contact Phone, Delivery Address, Project Notes) via `POST /api/v1/quotes`.
- Client-side selection is managed via a lightweight, persisted Zustand store (`use-quote.ts`), eliminating database cart churn for unauthenticated visitors.

### 2. Admin CMS as the Core Operational Cockpit

- The Admin Portal (`admin/`) becomes the primary revenue engine of the business:
  - **Quotation Management (`quotes/`)**: Real-time triage of incoming customer RFQs with full status filtering.
  - **Pricing Cockpit (`QuotePricingCockpit`)**: Dedicated interface allowing sales personnel to compare listed retail prices against customer requested prices, input negotiated unit prices (`agreedUnitPrice`), and apply discretionary discount percentages.
  - **Commercial Terms Negotiation**: Mandatory configuration of 5 core industrial terms: validity period, payment milestone schedule (e.g., 30% advance, 70% delivery), warranty duration, delivery lead time, and handover location.
  - **Quote Composer (`QuoteComposer`)**: Empowers sales reps to draft official quotes for offline/hotline inquiries with support for non-catalog custom line items.

### 3. Dual-Format Commercial Document Generation

- Direct browser print/PDF layout (`/quotes/[id]/export/`) producing a clean, corporate A4 bilingual quotation sheet with dual signature/seal blocks.
- Automated Excel export via `ExcelJS` (`backend/src/modules/quotes/services/quote-excel.service.ts`) producing an 8-column formatted spreadsheet complete with dynamic `SUM` formulas, VND number formatting, and Vietnamese currency-in-words conversion.

### 4. Legacy B2C Module Isolation & Phased Deprecation

- `CartModule` is formally marked as `@deprecated` (Issue #153).
- `PaymentsModule` (PayOS) is isolated from quotation operations; industrial transactions are settled via off-system corporate wire transfers according to agreed commercial milestones.
- `OrdersModule` retail guest checkout endpoints are quarantined, decoupling quotation approvals from automated retail delivery state machines (Issue #154).

---

## Consequences & Trade-offs

### Positive

- **Accurate Domain Alignment**: The software mirrors actual corporate machinery distribution workflows 1:1, eliminating unworkable retail QR checkouts.
- **Enhanced Enterprise Conversion**: B2B buyers readily submit contact and project specifications without the barrier of upfront digital payment.
- **Centralized Sales Authority**: Sales representatives gain full discretion over pricing margins, terms, and custom configuration while preserving an immutable audit log.
- **Type-Safe Contract Synchronization**: Full-stack Zod DTOs ensure that complex commercial terms and pricing calculations remain strictly typed across backend and frontend boundaries.

### Negative & Mitigations

- **Dormant Code Burden**: Existing database schemas and services for `cart`, `payments`, and retail `orders` remain in the codebase.
  - _Mitigation_: Tracked via GitHub Issues #153 and #154. Endpoints are annotated with deprecation warnings and isolated with clear module boundaries to prevent developer confusion.
- **Asynchronous Sales Friction**: Eliminating instant checkout introduces human-in-the-loop latency (a customer must wait for sales review).
  - _Mitigation_: Standard operating procedures enforce an automated initial acknowledgment email and rapid sales dispatching via the leads notification pipeline.
