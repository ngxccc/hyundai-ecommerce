# Phase 3: Orders Management Dashboard & Invoice PDF Export

**Date**: 01-06-26
**Complexity**: COMPLEX (Multi-phase)
**Status**: ✅ VERIFIED
**Implementation Approach**: Browser-Native High-Performance Print Layout
**Execution Model**: Phase-by-Phase with Pre-Research and Post-Testing

## Overview

This document specifies the detailed implementation plan for **Phase 3: Orders Management Dashboard & Invoice PDF Export** of the B2B CRM program. In this phase, we will expand `apps/admin` to enable staff members to list corporate orders, view buyers' business parameters, advance order fulfillment status, and export clean corporate invoices as PDFs.

We reference [process/context/all-context.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/all-context.md) for UI/UX specifications, styling palettes, and i18n rules, and [process/context/tests/all-tests.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/tests/all-tests.md) for automated verification rules.

---

## Quick Links

- [Phase 3: Orders Management Dashboard \& Invoice PDF Export](#phase-3-orders-management-dashboard--invoice-pdf-export)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [1. Context and Goals](#1-context-and-goals)
  - [Phase Completion Rules](#phase-completion-rules)
  - [1.5 Execution Brief](#15-execution-brief)
    - [Phase 1: Database Layer (Service Extensions)](#phase-1-database-layer-service-extensions)
    - [Phase 2: Actions \& i18n Setup](#phase-2-actions--i18n-setup)
    - [Phase 3: UI Dashboard Development](#phase-3-ui-dashboard-development)
    - [Phase 4: Page Routing \& Invoice Print Route](#phase-4-page-routing--invoice-print-route)
    - [Expected Outcome](#expected-outcome)
  - [1.75 Phased Execution Workflow](#175-phased-execution-workflow)
    - [Phase Workflow Pattern](#phase-workflow-pattern)
  - [2. Non-Goals and Constraints](#2-non-goals-and-constraints)
  - [3. Architecture Decisions (Final)](#3-architecture-decisions-final)
    - [AD-001: Bracket Notation for Drizzle Where Conditions](#ad-001-bracket-notation-for-drizzle-where-conditions)
    - [AD-002: Zero-Dependency Browser-Native Invoice Exports](#ad-002-zero-dependency-browser-native-invoice-exports)
  - [4. High-level Data Flow](#4-high-level-data-flow)
  - [5. Security Posture](#5-security-posture)
  - [6. Component Details](#6-component-details)
  - [7. Backend Endpoints and Workers](#7-backend-endpoints-and-workers)
  - [8. Database Schema](#8-database-schema)
  - [9. API Surface](#9-api-surface)
    - [1. Drizzle Service API](#1-drizzle-service-api)
    - [2. Next.js Server Actions](#2-nextjs-server-actions)
  - [10. Phased Delivery Plan](#10-phased-delivery-plan)
    - [Phase 1: Service and Tests (PLANNED)](#phase-1-service-and-tests-planned)
    - [Phase 2: Server Actions \& Translations (PLANNED)](#phase-2-server-actions--translations-planned)
    - [Phase 3: UI Components \& Layout Pages (PLANNED)](#phase-3-ui-components--layout-pages-planned)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Verification Evidence](#verification-evidence)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Implementation Checklist](#implementation-checklist)
    - [Step 1: Pre-Phase Research](#step-1-pre-phase-research)
    - [Step 2: Expand Order Service \& Mocks](#step-2-expand-order-service--mocks)
    - [Step 3: Server Actions \& Translations](#step-3-server-actions--translations)
    - [Step 4: Build UI Components](#step-4-build-ui-components)
    - [Step 5: Deploy Page Routers](#step-5-deploy-page-routers)
  - [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## 1. Context and Goals

EngageKit administrators and sales staff need a cockpit to manage orders, advance fulfillment status, and download corporate invoices.

**In-scope**:

- Expand `OrderService` inside `packages/database` with a `list` query.
- Create Server Action `updateOrderStatusAction` for state transitions.
- Build `order-list.tsx` UI with search, tab filters, and mobile cards grid.
- Build `order-detail.tsx` with a timeline stepper, buyer profile, items table, and transitions.
- Build `orders/[id]/invoice/page.tsx` print-only, zero-sidebar page with `window.print()` trigger.
- Add full Vietnamese/English translations to `vi.json` and `en.json`.

**Out-of-scope (V3)**:

- Automated PDF generation on server (browser printing only).
- Dynamic editing of order item prices (handled in Quote Phase 4).
- Automatic warehouse stock subtraction (handled in Phase 5).

---

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces (order updates correctly trigger state).
2. **Manual Test** - Admins can advance status and print invoices.
3. **Data Verification** - DB query verifies status transitions save correctly.
4. **Error Handling** - Edge cases (unauthorized, invalid status progression) are validated gracefully.
5. **User Confirmation** - User says "it works" after reviewing test outputs and live UI.

Status meanings:

- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working
- 🚧 BLOCKED - Has issues

After each phase, document:

- [ ] What was tested manually
- [ ] Data verified in DB (show query + result)
- [ ] Errors encountered and fixed
- [ ] User confirmation received

---

## 1.5 Execution Brief

### Phase 1: Database Layer (Service Extensions)

**What happens:** Add `list` query to `OrderService` fetching buyers, items, products, and bids. Write unit tests.

**Test:** Run `bun test src/services/order.service.test.ts` to ensure list and filters are fully asserted.

### Phase 2: Actions & i18n Setup

**What happens:** Create `updateOrderStatusAction` and configure `AdminOrders` localized keys in `en.json` and `vi.json`.

**Test:** Safe parsing of payloads, authentication, and route cache revalidation compiles.

### Phase 3: UI Dashboard Development

**What happens:** Build `order-list.tsx`, `order-detail.tsx`, and index barrels in `src/features/orders/components`.

**Test:** Components render cleanly, display timeline steppers, and are responsive on mobile.

### Phase 4: Page Routing & Invoice Print Route

**What happens:** Implement `/orders`, `/orders/[id]`, and `/orders/[id]/invoice` app routing.

**Test:** Page loads hydrated data, "Print Invoice" fires browser print view, typecheck and eslint pass 100% green.

### Expected Outcome

- Staff can search and navigate B2B orders in `/orders`.
- Order fulfillment detail is loaded dynamically.
- State transitions are successfully persisted in Postgres.
- Professional invoices are exported to PDF instantly.

---

## 1.75 Phased Execution Workflow

**IMPORTANT**: This plan uses a phase-by-phase execution model with built-in approval gates. Each phase follows this workflow:

### Phase Workflow Pattern

**Step 1: Pre-Phase Research**

- Read existing code patterns in codebase (e.g. `brand-form.tsx`, `userService.list`).
- Analyze similar implementations.
- Identify potential blockers or unknowns.
- Present findings to user for review and **STOP**. Wait for user approval before proceeding to Step 2.

**Step 2: Detailed Planning**

- Based on research, create detailed implementation steps.
- Specify exact files to create/modify.
- Define success criteria.
- Get user approval before proceeding.

**Step 3: Implementation**

- Execute approved plan exactly as specified.
- No deviations from approved approach.

**Step 4: Testing & Verification**

- Execute specific test scenarios (provided in Phase).
- Verify in database.
- Document results.

**Step 5: User Confirmation**

- Present post-stage summary:

  ```text
  **What's Functional Now**: Description of working features
  **What Was Tested**: Database queries, ESLint check, unit tests passed
  **What You Can Test**: Action steps in browser
  **Ready For**: Next stage
  ```

- Wait for user manual review and approval to proceed.

---

## 2. Non-Goals and Constraints

- **Non-Goals**:
  - Storefront user order history page (administered in Storefront app).
  - Multi-warehouse logistics optimization bidding panel (Phase 5).
  - Direct email attachments of invoices (handled in future phases).
- **Constraints**:
  - Must use existing orders and orderStatusEnum Postgres schema.
  - Bracket notation `whereConditions["status"]` is required to bypass strict Drizzle index signature compiler errors.
  - Mobile layouts must be fully responsive and optimized via horizontal scrolls and grid card views.

---

## 3. Architecture Decisions (Final)

### AD-001: Bracket Notation for Drizzle Where Conditions

- **Decision**: Avoid dot notation on Drizzle relational query builder where conditions typed as `Record<string, ...>` due to strict `noPropertyAccessFromIndexSignature` compiler flags; use bracket syntax `whereConditions["status"]`.
- **Rationale**: Keeps compilation 100% type-safe without necessitating `as any` type-assertion escapes.
- **Implications**: Clean service layer query.

### AD-002: Zero-Dependency Browser-Native Invoice Exports

- **Decision**: Deploy `/orders/[id]/invoice` as a print-only layout using CSS `@media print` rules and native `window.print()` triggers.
- **Rationale**: Instant load times, high-resolution rendering, zero bloated PDF libraries.
- **Implications**: User clicks print, and browser save-as-PDF dialog opens immediately.

---

## 4. High-level Data Flow

```text
+---------------+     Fetch list/detail     +-----------------------+
|  Admin Pages  | <------------------------ |  OrderService (DB)    |
+---------------+                           +-----------------------+
        |                                               ^
        | Call Action                                   |
        v                                               | Update State
+---------------+                                       |
| Server Action | --------------------------------------+
+---------------+
```

---

## 5. Security Posture

- **Authorization Gate**: Every Server Action and dashboard page router wraps around `requireAuth()` to assert the staff member is signed in and holds administrative privileges.
- **Input Sanitization**: Status inputs are parsed and validated via standard Zod types before hitting the services database layer.

---

## 6. Component Details

- **`OrderList`**: Renders dynamic search, status tabs, and responsive desktop table vs mobile cards.
- **`OrderDetail`**: Timeline progress stepper showing status checkmarks, corporate buyer info, pricing matrices, state transition button bars, and print invoice anchors.
- **`CustomerHeader`**: Unifies CRM sub-navigations.

---

## 7. Backend Endpoints and Workers

No API endpoints or background workers are required; all processes execute synchronously via Next.js Server Actions and server-side components.

---

## 8. Database Schema

We rely on the existing schema inside `packages/database/src/schemas/order.schema.ts`:

- Table: `orders`
- Fields: `id`, `userId`, `status`, `shippingFee`, `shippingAddress`, `totalAmount`, `createdAt`, `updatedAt`

---

## 9. API Surface

### 1. Drizzle Service API

```typescript
class OrderService {
  async list(filters?: { status?: TOrder["status"] }): Promise<ComplexOrder[]>;
  async updateOrderStatus(
    id: string,
    status: TOrder["status"],
  ): Promise<TOrder | undefined>;
  async getComplexOrder(orderId: string): Promise<ComplexOrder | undefined>;
}
```

### 2. Next.js Server Actions

```typescript
export const updateOrderStatusAction = async (
  orderId: string,
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded",
) => Promise<{ success: boolean; data?: TOrder; error?: string }>;
```

---

## 10. Phased Delivery Plan

### Phase 1: Service and Tests (PLANNED)

- Add `list` query to `packages/database/src/services/order.service.ts`.
- Write unit tests in `order.service.test.ts`.

### Phase 2: Server Actions & Translations (PLANNED)

- Write `order.actions.ts`.
- Configure English/Vietnamese `AdminOrders` translations inside `en.json` and `vi.json`.

### Phase 3: UI Components & Layout Pages (PLANNED)

- Build `order-list.tsx` and `order-detail.tsx`.
- Create `/orders`, `/orders/[id]`, and `/orders/[id]/invoice` Next.js pages.

---

## Acceptance Criteria

The following B2B Orders Management & Invoice PDF Export acceptance criteria must be satisfied:

1. **Responsive Listings**: Staff can navigate all B2B orders with responsive search, filter tabs, and responsive card grids on mobile.
2. **Order Detail Cockpit**: Detailed Order detail cockpit exhibits structured Buyer portfolios, item listings, and status timeline steppers.
3. **Fulfillment State Actions**: Staff can advance order states correctly through Server Actions and revalidate views.
4. **Lightweight Print Invoice**: "Print Invoice" route displays clean corporate bills with auto-print capability for clean browser PDF saving.
5. **Zero Compile Errors**: All code complies with strict Type check and ESLint policies with zero errors.

---

## Touchpoints

- [order.service.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/order.service.ts)
- [order.service.test.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/packages/database/src/services/order.service.test.ts)
- [order.actions.ts](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/orders/actions/order.actions.ts)
- [order-list.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/orders/components/order-list.tsx)
- [order-detail.tsx](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/src/features/orders/components/order-detail.tsx)
- [page.tsx (list)](<file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/app/[locale]/(dashboard)/orders/page.tsx>)
- [page.tsx (detail)](<file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/app/[locale]/(dashboard)/orders/[id]/page.tsx>)
- [page.tsx (invoice)](<file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/app/[locale]/(dashboard)/orders/[id]/invoice/page.tsx>)
- [en.json](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/messages/en.json)
- [vi.json](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/apps/admin/messages/vi.json)

---

## Public Contracts

- `orderService.list`
- `updateOrderStatusAction`
- `/orders/[id]/invoice` print layout page

---

## Blast Radius

- Blast radius is strictly constrained to the `/orders` dashboard directories.
- Payments, storefront checkouts, and customer profiles remain completely unaffected.

---

## Verification Evidence

- Run Bun tests: `bun test src/services/order.service.test.ts` (inside `packages/database`).
- Run TypeScript compiler: `bunx tsc -p tsconfig.json --noEmit` (inside `apps/admin`).
- Run ESLint checker: `bun run lint` (inside `apps/admin`).

---

## Resume and Execution Handoff

1. Consult [process/context/all-context.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/context/all-context.md) for UX styles and i18n guidelines.
2. Read [process/features/crm/active/crm-crm-roadmap_PLAN_01-06-26.md](file:///home/ngxc/workspace/fullstack/hyundai-ecommerce/process/features/crm/active/crm-crm-roadmap_PLAN_01-06-26.md) for macro architecture.
3. Open this plan and proceed with **Step 1: Expand Order Service & Mocks** in the checklist.

---

## Implementation Checklist

### Step 1: Pre-Phase Research

- [x] Inspect existing `orders` and `orderItems` queries inside `packages/database`.
- [x] Check exact syntax of `complexOrderQueryConfig` inside `order.service.ts`.
- [x] Present findings to the user and **STOP**. Wait for user approval before moving to Step 2.

### Step 2: Expand Order Service & Mocks

- [x] Add `list` query to `packages/database/src/services/order.service.ts`.
- [x] Write co-located unit tests in `order.service.test.ts`.
- [x] Run `bun test` to confirm 100% green tests.

### Step 3: Server Actions & Translations

- [x] Create `order.actions.ts` inside `apps/admin/src/features/orders/actions/`.
- [x] Export action via index barrel.
- [x] Insert B2B `AdminOrders` translation strings in `en.json`.
- [x] Insert B2B `AdminOrders` translation strings in `vi.json`.

### Step 4: Build UI Components

- [x] Create `order-list.tsx` featuring search, tabs filtering, and mobile responsive card lists.
- [x] Create `order-detail.tsx` featuring timeline progress stepper, buyer portfolio, items table, and actions button bar.
- [x] Create components export index barrel.

### Step 5: Deploy Page Routers

- [x] Implement listing router `/orders/page.tsx`.
- [x] Implement detail router `/orders/[id]/page.tsx`.
- [x] Implement auto-print invoice `/orders/[id]/invoice/page.tsx` print route.
- [x] Run `bunx tsc -p tsconfig.json --noEmit` and `bun run lint` to assert 100% green.

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan Mode**:
  - Import the checklist and execute phase-by-phase.
  - **Stop and run verification** after each phase before proceeding.
- **RIPER-5**:
  - We are currently in **PLAN** mode. Once the user approves this detailed plan, we will transition to **EXECUTE** mode and begin pre-phase research!
  - Next Step: ENTER EXECUTE MODE for Phase 3 checklist research.
