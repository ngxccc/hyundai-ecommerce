# Phase 4: Quote Negotiation Chat & Pricing Cockpit

**Date**: 02-06-26
**Complexity**: COMPLEX (Phase Plan)
**Status**: ⏳ IN_PROGRESS (Phase 4 Completed, pending review)
**Implementation Approach**: Dynamic Bento Dashboard with Atomic Transaction Quote-to-Order Conversion
**Execution Model**: Phase-by-Phase with Pre-Research and Post-Testing

## Overview

This document specifies the detailed implementation plan for **Phase 4: Quote Negotiation Chat & Pricing Cockpit** of the B2B CRM program. In this phase, we will implement the dynamic quotation detail page (`/quotes/[id]`) in `apps/admin`. It will feature a dual-pane workspace: a **Pricing Cockpit** for modifying line-item prices, and a **Negotiation Chat** window displaying a live dialogue feed (stored in `quote_messages`) along with automated system log events. We will also implement the critical business transition that locks terms, updates the database, and converts approved quotes into active Postgres B2B Orders through an atomic database transaction.

We reference [process/context/all-context.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/all-context.md) for UI/UX style guidelines and i18n instructions, and [process/context/tests/all-tests.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/tests/all-tests.md) for testing and typecheck rules.

---

## Quick Links

- [Phase 4: Quote Negotiation Chat \& Pricing Cockpit](#phase-4-quote-negotiation-chat--pricing-cockpit)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [1. Context and Goals](#1-context-and-goals)
  - [Phase Completion Rules](#phase-completion-rules)
  - [1.5 Execution Brief](#15-execution-brief)
    - [Phase Group 1: Service Extensions \& Unit Tests](#phase-group-1-service-extensions--unit-tests)
    - [Phase Group 2: Actions \& i18n Locales](#phase-group-2-actions--i18n-locales)
    - [Phase Group 3: Pricing Cockpit \& Chat UI Components](#phase-group-3-pricing-cockpit--chat-ui-components)
    - [Phase Group 4: Detail Route Integration \& Handoff](#phase-group-4-detail-route-integration--handoff)
    - [Expected Outcome](#expected-outcome)
  - [Phased Execution Workflow](#phased-execution-workflow)
    - [Phase Workflow Pattern](#phase-workflow-pattern)
    - [Example Phase Execution](#example-phase-execution)
  - [2. Non-Goals and Constraints](#2-non-goals-and-constraints)
  - [3. Architecture Decisions (Final)](#3-architecture-decisions-final)
    - [AD-001: Atomic Transaction-based Quote-to-Order Conversion](#ad-001-atomic-transaction-based-quote-to-order-conversion)
    - [AD-002: Dual-Pane Flex/Grid Layout with Independent Scrolling](#ad-002-dual-pane-flexgrid-layout-with-independent-scrolling)
    - [AD-003: Unified Timeline Chat + Event Feed](#ad-003-unified-timeline-chat--event-feed)
  - [4. High-level Data Flow](#4-high-level-data-flow)
  - [5. Security Posture](#5-security-posture)
  - [6. Component Details](#6-component-details)
  - [7. Backend Endpoints and Workers](#7-backend-endpoints-and-workers)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Verification Evidence](#verification-evidence)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [17. Cursor + RIPER-5 Guidance](#17-cursor--riper-5-guidance)
  - [Implementation Checklist](#implementation-checklist)
    - [Phase Group 1: Service Extensions \& Unit Tests](#phase-group-1-service-extensions--unit-tests-1)
    - [Phase Group 2: Actions \& Locales](#phase-group-2-actions--locales)
    - [Phase Group 3: Core UIs](#phase-group-3-core-uis)
    - [Phase Group 4: Page Integration](#phase-group-4-page-integration)

---

## 1. Context and Goals

Corporate buyers (Dealers) initiate quotes from the Storefront for custom industrial equipment lots. Admin staff need a cockpit to negotiate line-item discounts, chat with the client, track revision histories, and lock negotiated prices. Once both parties reach an agreement, the quote is approved and must instantly transition into a standard system Order so fulfillment can proceed.

**In-scope**:

- Extend `quotes` database schema to link with `orders` via `orderId` mapping column.
- Extend `QuotesService` to support quote-to-order transaction transitions.
- Implement server actions for:
  - Modifying `agreedPrice` on individual quote items.
  - Adding text messages to the `quote_messages` timeline.
  - Advancing status to `negotiating`, `rejected`, or `approved`.
  - Atomically converting an approved quote into an Order with status `pending`.
- Implement `/quotes/[id]` detail page containing:
  - **Pricing Cockpit**: Line-item catalog with retail prices, dealer requested prices, and currency-formatted input components for agreed prices.
  - **Negotiation Chat**: Live message window displaying system events (status changes, price updates) and user chat logs.
  - **Control Bar**: Action buttons to start negotiation, reject, or approve and convert the quote.
- Localize all hardcoded elements into English (`en.json`) and Vietnamese (`vi.json`) within `apps/admin`.

**Out-of-scope (Future)**:

- Real-time WebSockets/SSE sync (page relies on standard React Server Component revalidation or state polling).
- Live storefront dealer chat view (handled in Storefront client app).
- Editing quantity of quote items (locked at creation time; price adjustments only).

---

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Does it work with other pieces end-to-end? (Quotes convert to Orders with exact negotiated prices and relational mapping).
2. **Manual Test** - Admins can type counter-offers, send chat logs, and trigger quote conversions.
3. **Data Verification** - Database queries confirm status changes and order insertions save correctly.
4. **Error Handling** - Edge cases (unauthorized users, converting already-approved quotes, invalid price changes) are validated gracefully.
5. **User Confirmation** - User visually asserts success after reviewing test outputs and terminal checks.

Status meanings:

- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working

After each phase, document:

- [ ] What was tested manually
- [ ] Data verified in DB (show query + result)
- [ ] Errors encountered and fixed
- [ ] User confirmation received

---

## 1.5 Execution Brief

### Phase Group 1: Service Extensions & Unit Tests

- **What happens**: Modify `quotes.schema.ts` to add nullable `orderId` references column and run migrations. Add transaction-level B2B conversion methods to `QuotesService` inside `packages/database`. Write unit tests in `quotes.service.test.ts`.
- **Integration points**: Connects quote statuses to `OrderService` and schemas.
- **Test**: Run `bun test src/services/quotes.service.test.ts` to assert transaction queries.
- **Verify**: Verify correct schema parameters in transaction hooks and foreign keys.
- **Done when**: 100% green tests in `packages/database`.

### Phase Group 2: Actions & i18n Locales

- **What happens**: Create Server Actions for saving counters, appending messages, and executing conversions. Set up `vi.json` and `en.json` keys under namespace `AdminQuotes`.
- **Integration points**: Connects admin router layout to `QuotesService`.
- **Test**: Action validation compiles under tsc; unauthorized clients receive strict error codes.
- **Verify**: Run `tsc --noEmit` on `apps/admin` to assert strict type matches. Session authentication token is parsed on server.
- **Done when**: Compile check is fully clean.

### Phase Group 3: Pricing Cockpit & Chat UI Components

- **What happens**: Build the React Client components: `quote-pricing-cockpit.tsx`, `quote-negotiation-chat.tsx`, and `quote-header.tsx`.
- **Integration points**: Renders inside `/quotes/[id]`.
- **Test**: Input boxes allow changing decimal values; scrollbars lock within bento containers. Formatting shows thousands separator on gõ.
- **Verify**: Page fits within desktop layout without horizontal overflow.
- **Done when**: UI layout is completely responsive and clean.

### Phase Group 4: Detail Route Integration & Handoff

- **What happens**: Implement the dynamic route `app/[locale]/(dashboard)/quotes/[id]/page.tsx` pulling from RSC. Confirm conversion redirects to `/orders/[orderId]`.
- **Integration points**: App Router layout.
- **Test**: Click "Approve & Convert", verify browser redirects to the correct order page. Validate concurrency check (if quote already approved, blocks further modifications).
- **Verify**: Run `bun run lint` and `tsc` on `apps/admin`.
- **Done when**: User manual testing passes and status shifts to VERIFIED.

### Expected Outcome

- Admins have a dashboard workspace at `/quotes/[id]` to negotiate B2B deals.
- All counter-offers and chat logs persist in Postgres.
- Approved quotes convert seamlessly to Orders with zero price drift.

---

## Phased Execution Workflow

### Phase Workflow Pattern

**Step 1: Pre-Phase Research**

- Read existing Drizzle transaction patterns in `order.service.ts`.
- Check styling conventions of chat lists and input cards in other dashboard components.
- Present findings to the user and **STOP**. Wait for user approval before moving to Step 2.

**Step 2: Detailed Planning**

- Outline exact schema columns and Drizzle kit commands to verify database state.
- Create step-by-step code checkpoints and get approval.

**Step 3: Implementation**

- Write code exactly as specified in the checklist.

**Step 4: Testing & Verification**

- Run unit tests and verify Postgres parameters.

**Step 5: User Confirmation**

- Present a post-stage summary and wait for user manual check before changing status to ✅ VERIFIED.

### Example Phase Execution

```text
User: "Begin Phase Group 1: Service Extensions"

Assistant (Pre-Phase Research):
- Reading transaction patterns in order.service.ts...
- Found: Relies on `this.db.transaction()` to ensure atomicity.
- Proposed: Implement `convertToOrder(quoteId)` using nested inserts.
- Do you approve proceeding?

User: "Yes, proceed"

[Assistant continues to Planning, Implementation, and Verification...]
```

---

## 2. Non-Goals and Constraints

- **Non-Goals**:
  - Live socket subscription updates (Admin refreshes page or triggers actions which revalidate the cache).
  - Editing product lists on the fly (adding/deleting items). Items must match the original quote request.
- **Constraints**:
  - Must use existing `quotes`, `quote_items`, and `quote_messages` tables.
  - Transactions must use Drizzle Kit Transaction APIs to guarantee atomicity.
  - All UI elements must support Vietnamese/English localization.

---

## 3. Architecture Decisions (Final)

### AD-001: Atomic Transaction-based Quote-to-Order Conversion

- **Decision**: Perform quote conversion inside a single database transaction (`db.transaction()`) at the service layer.
- **Rationale**: If order creation succeeds but quote status update fails (or vice versa), the system will end up in an inconsistent state (e.g., duplicate orders or orphaned quotes). Transactions ensure either both succeed or both roll back.
- **Implications**: `QuotesService.approveAndConvertToOrder` wraps order creation, order items insertion, quote state change (locking the quote and writing `orderId`), and system chat log writing into a single atomic routine.

### AD-002: Dual-Pane Flex/Grid Layout with Independent Scrolling

- **Decision**: Layout the `/quotes/[id]` dashboard using a 2-column grid layout (`grid-cols-1 lg:grid-cols-3`) on desktop, stacking on mobile.
- **Rationale**: Gives admins side-by-side visibility of negotiated prices (left) and chat context (right) without scrolling the page.
- **Implications**: The chat container uses a fixed max-height (`h-[calc(100vh-280px)]`) with `overflow-y-auto` to keep chat inputs anchored.

### AD-003: Unified Timeline Chat + Event Feed

- **Decision**: Merge chat messages and system audit logs (e.g., _"Admin updated item A price to 10,000,000 VND"_, _"Admin started negotiation"_) into a single chronological timeline.
- **Rationale**: Provides a clear, temporal audit trail of how the negotiation proceeded directly within the conversation window.
- **Implications**: System events are written as special message records into the `quote_messages` table (using system sender ID or specific notation), sorted by `createdAt` ascending.

---

## 4. High-level Data Flow

```text
+-----------------------+
|  Quotes detail Page   | (Renders cockpit + timeline)
+-----------------------+
      |             ^
      | Action      | Revalidate / Redirect
      v             |
+-----------------------+      Atomic Transaction      +--------------------+
|  Server Action        | ---------------------------> | Quotes & Orders DB |
+-----------------------+                              +--------------------+
```

---

## 5. Security Posture

- **Role Authorization**: All quote modification actions are guarded with `requireAuth()` to verify that the logged-in staff member has administrative privileges.
- **Server-driven Sender ID**: `sendQuoteMessageAction` and other client-facing triggers must extract the `userId` directly from the authenticated session (via Clerk auth) on the server side instead of accepting it as a client-provided argument, avoiding ID spoofing.
- **Concurrency & State Validation**: Actions assert that the quote's current status is eligible for change (e.g., an already `approved` or `rejected` quote cannot have its item prices modified or be converted to an order again). Every transaction checks status in DB before writing.

---

## 6. Component Details

- **`QuoteHeader`**: Displays quote ID, buyer name, creation date, status badge, and control buttons (Reject, Start Negotiating).
- **`QuotePricingCockpit`**: Displays itemized grid. Price inputs support real-time formatting (adding thousands separator as the admin types) and update individual rows dynamically. Inputs are disabled when saving or if the quote is locked.
- **`QuoteNegotiationChat`**: Renders message log (sender vs receiver bubbles, system logs) with an input textbox to submit counter-proposals.

---

## 7. Backend Endpoints and Workers

No API endpoints or workers are required; all business logic runs within server components and Next.js server actions.

---

## Touchpoints

- [quotes.schema.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/schemas/quotes.schema.ts) — The Drizzle table definitions (modified to add `orderId`).
- [quotes.service.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/quotes.service.ts) — Database service class exposing B2B queries.
- [quotes.service.test.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/quotes.service.test.ts) — Co-located unit tests covering mocks and service assertions.
- [quote.actions.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/quotes/actions/quote.actions.ts) — Server actions for handling negotiation logic.
- [quote-header.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/quotes/components/quote-header.tsx) — Header for showing details and control triggers.
- [quote-pricing-cockpit.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/quotes/components/quote-pricing-cockpit.tsx) — Prices counter modification cockpit with thousand separators format.
- [quote-negotiation-chat.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/quotes/components/quote-negotiation-chat.tsx) — Live chat log message window.
- [page.tsx](<file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/app/%5Blocale%5D/(dashboard)/quotes/%5Bid%5D/page.tsx>) — dynamic details page routing.
- [en.json](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/messages/en.json) — English i18n locales.
- [vi.json](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/messages/vi.json) — Vietnamese i18n locales.

---

## Public Contracts

The following core public contracts will be established or integrated:

1. **Service Interfaces**:
   - `QuotesService.approveAndConvertToOrder(quoteId: string, adminUserId: string)`: Triggers order generation and locks quote status under one transaction.

2. **Actions Interfaces**:
   - `approveAndConvertToOrderAction(quoteId: string)`: Maps validation and revalidates paths.
   - `updateQuoteItemPriceAction(quoteId: string, itemId: string, agreedPrice: string)`: Updates counters and logs audit events.
   - `sendQuoteMessageAction(quoteId: string, message: string)`: Appends to messages feed.

---

## Blast Radius

- **Database System**: Changes are safe; database writes are localized to new order records inside transactional scope.
- **Fulfillment System**: Existing orders list displays converted orders properly with zero regression.

---

## Verification Evidence

- **Database Unit Tests**: Run `bun test src/services/quotes.service.test.ts` inside `packages/database`.
- **TypeScript compilation**: Run `bunx tsc -p tsconfig.json --noEmit` inside `apps/admin`.
- **ESLint checks**: Run `bun run lint` inside `apps/admin`.

---

## Acceptance Criteria

The following B2B Quotes negotiation cockpit acceptance criteria must be satisfied:

1. **Pricing Adjustments**: Admin can dynamically update the counter agreed price of individual items and see total sum changes.
2. **Timeline Auditing**: Messaging log displays both text message logs and system status change notices chronologically.
3. **Atomic Transition**: Approving a quote locks all modifications, shifts quote status to approved, and inserts a matching pending order.
4. **i18n Localization**: Interface is fully translated into English and Vietnamese based on app router locale context.
5. **Robust Security**: Actions strictly block invalid status modifications (e.g. updating rejected quotes) and verify permissions.
6. **Double-Click Safe & Loading state**: Pricing inputs and submit buttons show loading spinners and disable themselves while processing transactions.

---

## Resume and Execution Handoff

1. Consult [process/context/all-context.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/all-context.md) for style requirements.
2. Read [process/features/crm/active/crm-crm-roadmap_PLAN_01-06-26.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/features/crm/active/crm-crm-roadmap_PLAN_01-06-26.md) for CRM overview.
3. Open this plan file and proceed with **Step 1.1: Pre-Phase Research** of the implementation checklist.

---

## 17. Cursor + RIPER-5 Guidance

- **Cursor Plan Mode**:
  - Load this plan and follow the checklist step-by-step.
  - Run verification commands after completing each phase group.
- **RIPER-5**:
  - We are currently in **PLAN** mode. Once the user approves this plan, we will move to **EXECUTE** mode.
  - Next Step: Wait for user approval of this plan.

---

## Implementation Checklist

### Phase Group 1: Service Extensions & Unit Tests

- [x] **Step 1.1: Pre-Phase Research**
  - Analyze transaction APIs in Drizzle inside `packages/database`.
  - Review how `OrderService` inserts orders and items.
  - Verify schema files for adding relational column `orderId` to `quotes`.
  - Present research findings and wait for user approval.
- [x] **Step 1.2: Detailed Planning**
  - Detail Drizzle queries for creating orders and order items inside transaction scope.
  - Map variables and parameters. Get approval.
- [x] **Step 1.3: Implementation**
  - Add `orderId` references column to `quotes.schema.ts` inside `packages/database`. Run `bun run db:generate` to output new SQL migration files.
  - Implement `approveAndConvertToOrder` method in [quotes.service.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/quotes.service.ts).
- [x] **Step 1.4: Testing & Verification**
  - Write tests inside [quotes.service.test.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/quotes.service.test.ts) asserting transaction parameters and `orderId` assignment.
  - Run `bun test src/services/quotes.service.test.ts` to confirm green checks.
- [x] **Step 1.5: User Confirmation**
  - Provide progress report and get approval.

### Phase Group 2: Actions & Locales

- [x] **Step 2.1: Pre-Phase Research**
  - Verify action definitions and error handling structures in other features.
  - Review session auth parsing guidelines.
  - Review dictionary schema for English and Vietnamese.
  - Present research findings and wait for user approval.
- [x] **Step 2.2: Detailed Planning**
  - Draft action schema parameter check. Get approval.
- [ ] **Step 2.3: Implementation**
- [x] **Step 2.3: Implementation**
  - Create [quote.actions.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/quotes/actions/quote.actions.ts) with status updates, pricing updates, message creation, and order conversion actions. Ensure `senderId` is server-resolved and status is verified in DB.
  - Export actions from `apps/admin/src/features/quotes/actions/index.ts`.
  - Add locale translations keys inside [en.json](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/messages/en.json) and [vi.json](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/messages/vi.json).
- [x] **Step 2.4: Testing & Verification**
  - Perform `tsc` typecheck inside `apps/admin/` to ensure clean integrations.
- [x] **Step 2.5: User Confirmation**
  - Provide progress report and get approval.

### Phase Group 3: Core UIs

- [x] **Step 3.1: Pre-Phase Research**
  - Analyze Bento box layout components in UI library.
  - Check details for scroll behaviors and input controls.
  - Present research findings and wait for user approval.
- [x] **Step 3.2: Detailed Planning**
  - Finalize styling tags and inputs layout details. Get approval.
- [x] **Step 3.3: Implementation**
  - Implement [quote-header.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/quotes/components/quote-header.tsx).
  - Implement [quote-pricing-cockpit.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/quotes/components/quote-pricing-cockpit.tsx) supporting currency inputs format.
  - Implement [quote-negotiation-chat.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/quotes/components/quote-negotiation-chat.tsx).
  - Create components export barrel `apps/admin/src/features/quotes/components/index.ts`.
- [x] **Step 3.4: Testing & Verification**
  - Run typecheck checks and linter.
- [x] **Step 3.5: User Confirmation**
  - Provide progress report and get approval.

### Phase Group 4: Page Integration

- [x] **Step 4.1: Pre-Phase Research**
  - Audit dashboard navigation parameters and hydration patterns.
  - Present research findings and wait for user approval.
- [x] **Step 4.2: Detailed Planning**
  - Draft data loading layout sequence. Get approval.
- [x] **Step 4.3: Implementation**
  - Implement dynamic page router at [page.tsx](<file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/app/%5Blocale%5D/(dashboard)/quotes/%5Bid%5D/page.tsx>).
- [x] **Step 4.4: Testing & Verification**
  - Perform full typecheck check (`bunx tsc -p tsconfig.json --noEmit`) and linter (`bun run lint`).
  - Test entire flow manually on mock DB parameters.
- [x] **Step 4.5: User Confirmation**
  - Present complete handoff summary and request final verification approval.
