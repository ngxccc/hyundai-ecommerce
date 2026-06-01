# B2B CRM & Operations Dashboard Roadmap

**Date**: 01-06-26
**Complexity**: Complex
**Status**: ⏳ PLANNED

## Overview

This document is the master orchestration/umbrella plan for implementing the missing B2B CRM and Operations Dashboard components in `apps/admin`. Building upon our core equipment commerce engine, we will systematically deliver key corporate dealer features, quote/negotiation cockpits, order fulfillment workflows, and shipping bid selectors.

We read `process/context/all-context.md` for project architecture, database schemas, and i18n rules, and `process/context/tests/all-tests.md` for automated verification stages.

## Quick Links

- [B2B CRM \& Operations Dashboard Roadmap](#b2b-crm--operations-dashboard-roadmap)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [Phase Completion Rules](#phase-completion-rules)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Phased Delivery Plan](#phased-delivery-plan)
    - [Phase 1: B2B Quotes Database Schema Extensions](#phase-1-b2b-quotes-database-schema-extensions)
    - [Phase 2: Customer Directory \& Dealer Tiers Management](#phase-2-customer-directory--dealer-tiers-management)
    - [Phase 3: Orders Management Dashboard \& Invoice PDF Export](#phase-3-orders-management-dashboard--invoice-pdf-export)
    - [Phase 4: Quote Negotiation Chat \& Pricing Cockpit](#phase-4-quote-negotiation-chat--pricing-cockpit)
    - [Phase 5: Logistics Carrier Bidding Panel](#phase-5-logistics-carrier-bidding-panel)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Verification Evidence](#verification-evidence)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Cursor + VIPER-5 Guidance](#cursor--viper-5-guidance)

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces
2. **Manual Test** - User can perform the action
3. **Data Verification** - Database/state changes confirmed
4. **Error Handling** - Failure cases handled gracefully
5. **User Confirmation** - User says "it works"

Status meanings:

- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working
- 🚧 BLOCKED - Has issues

## Touchpoints

This CRM program touches multiple layers across the monorepo:

- **Database Schema Package** (`packages/database/src/schemas/`):
  - `quotes.schema.ts` (New schema mapping quotes, quote items, and offer messages)
  - `order.schema.ts` & `shipping-bid.schema.ts` (Reading existing schemas)
- **Admin App Features** (`apps/admin/src/features/`):
  - `quotes/` (New feature modules)
  - `orders/` (New feature modules)
  - `customers/` (New feature modules)
- **Admin App Pages** (`apps/admin/app/[locale]/(dashboard)/`):
  - `quotes/` (App router detail & listing pages)
  - `orders/` (App router detail & listing pages)
  - `customers/` (App router directory & tier boards)

## Public Contracts

The following core public contracts will be established or integrated:

1. **Drizzle Services**: Co-located CRUD operations for Quotes, Orders, and Customers inside `packages/database/src/services`.
2. **App Actions**: Action result unions returned from server actions to frontend components supporting error tracking.
3. **B2B Pricing API Hooks**: The calculations matching product retail prices against active `dealerTiers` discount percentages.

## Blast Radius

Since this program implements new pages and features, the blast radius is highly isolated. It will not break existing storefront shopping carts, product lookups, or staff authentication. The database migrations will only add tables and columns without breaking current selections.

---

## Phased Delivery Plan

This B2B CRM program will be executed phase by phase. Each phase will have its own direct plan file created when it enters development.

### Phase 1: B2B Quotes Database Schema Extensions

- **What happens**: Define the missing quotes schema (`quotes.schema.ts`), quote items, and pricing counter-offer messages in the database. Run migrations.
- **Test**: Run Drizzle migrations checks and verify tables exist.
- **Verify**: Run database connectivity tests via `bun test` against the new services.
- **Done when**: Verification schemas compile successfully and `quotes` tables are fully migrated in PostgreSQL.

### Phase 2: Customer Directory & Dealer Tiers Management

- **What happens**: Build the customer portfolio UI (`/customers`) and the dealer discount tier configurator (`/customers/tiers`).
- **Test**: Manual navigation to CRM tables. Toggle standard consumers vs corporate dealers.
- **Verify**: Create a tier, assign it to a customer, and verify the discount percentage maps in database records.
- **Done when**: Admin can dynamically promote a customer to a Dealer and change their active tier.

### Phase 3: Orders Management Dashboard & Invoice PDF Export

- **What happens**: Build the order directory listing (`/orders`) and detailed order workflow cards (`/orders/[id]`), integrating standard fulfillment state transitions.
- **Test**: Click through orders list, trigger processing, shipment, and print invoice PDFs.
- **Verify**: Verify order status updates reflect correctly inside the database tables.
- **Done when**: Admin is able to fully update order fulfillment states and export clean PDF invoices.

### Phase 4: Quote Negotiation Chat & Pricing Cockpit

- **What happens**: Build the pricing negotiation cockpit (`/quotes/[id]`) showing offer items alongside a live dialogue chat window for negotiating discounts.
- **Test**: Send pricing counters, change items prices, and approve/reject quote deals.
- **Verify**: Verify final quote parameters save successfully and trigger order transitions in database state.
- **Done when**: Approved quotes can be successfully converted to active paid Orders.

### Phase 5: Logistics Carrier Bidding Panel

- **What happens**: Build the bidding sub-panel inside the Order details view (`/orders/[id]`) showing carrier bids and enabling selection.
- **Test**: Add carrier bids, review quotes, select winning bid, and verify shipping fee updates.
- **Verify**: Verify selected shipping bid updates the parent order's shipping pricing.
- **Done when**: Order shipping fees can be dynamically calculated from carrier bids.

## Acceptance Criteria

The master roadmap B2B CRM program is considered complete when the following high-level criteria are verified:

1. ✅ B2B Quotes Schema is fully implemented and migrated to PostgreSQL.
2. ✅ Admin can view standard customers vs corporate dealers and manage corporate discount structures (Dealer Tiers).
3. ✅ Order Fulfillment flow is fully operational, with visual order listings, status transitions, and PDF invoice generation.
4. ✅ Quotes Negotiation Chat and pricing counter-offer panel is complete, enabling live negotiation between Admin and Dealer.
5. ✅ Logistics Bidding is integrated, allowing carrier selection to automatically update order shipping fees.

## Verification Evidence

For each phase of the program, we will run strict typescript compilation (`tsc --noEmit`) and linting checks.
Each phase plan will define specific `curl` triggers and automated tests to verify the UI.

We will provide:

- Schema migration logs for Phase 1.
- Complete UI test recordings / snapshots for CRM, Order, and Quote screens.
- Service database tests.

## Resume and Execution Handoff

For the resumed executor:

1. Start with **Phase 1 (Database schemas)** to ensure database services are ready.
2. Read this master roadmap `process/features/crm/active/crm-crm-roadmap_PLAN_01-06-26.md` to calibrate overall intent.
3. Open the corresponding phase-specific plan file (e.g. `process/features/crm/active/phase-1-quotes-schema_PLAN_01-06-26.md`) when executing individual phase milestones.

## Cursor + VIPER-5 Guidance

- **Cursor Plan Mode**:
  - Load this master plan for overall roadmap visibility.
  - Open and execute from one phase plan at a time.
- **RIPER-5 Mode**:
  - We are currently in **PLAN** mode. Once the user approves this roadmap plan, we will create the detailed plan for Phase 1 and request execution.
  - Next Step: ENTER EXECUTE MODE for Phase 1 plan creation.
