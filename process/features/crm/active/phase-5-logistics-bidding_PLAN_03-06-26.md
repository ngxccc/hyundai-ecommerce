# Phase 5: Logistics Carrier Bidding Panel

**Date**: 03-06-26
**Complexity**: Complex (single-phase within CRM program)
**Status**: 🔨 CODE DONE
**Approved Design**: Option A — Embedded Bidding Sub-Panel inside existing Order Detail view

---

## Overview

Implement the Logistics Carrier Bidding Panel as a sub-component inside the existing Order Detail page (`/orders/[id]`). Admin users can view carrier bids, add new bids, select a winning bid, and have the parent order's `shippingFee` automatically updated. All user-facing strings are externalized to `messages/vi.json` and `messages/en.json`.

This phase reuses the pre-existing `shipping_bid` schema and the `bids` relation already loaded by `OrderService.getComplexOrder()`.

---

## Quick Links

- [Phase 5: Logistics Carrier Bidding Panel](#phase-5-logistics-carrier-bidding-panel)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [Phase Completion Rules](#phase-completion-rules)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Functional Requirements](#functional-requirements)
  - [Non-Functional Requirements](#non-functional-requirements)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Implementation Checklist](#implementation-checklist)
    - [Phase 0 — Preparation (Messages \& Context)](#phase-0--preparation-messages--context)
    - [Phase 1 — Service Layer Extension](#phase-1--service-layer-extension)
    - [Phase 2 — Server Action](#phase-2--server-action)
    - [Phase 3 — UI Component](#phase-3--ui-component)
    - [Phase 4 — Verification \& Localization](#phase-4--verification--localization)
  - [Verification Evidence](#verification-evidence)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** — Works with other system pieces
2. **Manual Test** — User can perform the action
3. **Data Verification** — Database/state changes confirmed
4. **Error Handling** — Failure cases handled gracefully
5. **User Confirmation** — User says "it works"

Status meanings:

- ⏳ PLANNED — Not started
- 🔨 CODE DONE — Written but not E2E tested
- 🧪 TESTING — Currently being tested
- ✅ VERIFIED — Tested AND confirmed working
- 🚧 BLOCKED — Has issues

---

## Touchpoints

This phase touches the following modules:

- **Database Layer** (`packages/database/src/`):
  - `schemas/shipping-bid.schema.ts` (read-only reuse)
  - `schemas/order.schema.ts` (read `shippingFee`)
  - `services/order.service.ts` (extend with `selectWinningBid`)
  - `services/index.ts` & `registry.ts` (re-export new method)

- **Admin App** (`apps/admin/`):
  - `src/features/orders/components/order-detail.tsx` (embed `<ShippingBidPanel>`)
  - `src/features/orders/actions/order.actions.ts` (new server action `selectShippingBid`)
  - `app/[locale]/(dashboard)/orders/[id]/page.tsx` (no change — already passes full order)
  - `messages/vi.json` + `messages/en.json` (new flat keys under `AdminOrders`)

- **Shared**:
  - No new shared contracts required (reuses `ComplexOrder` type)

---

## Public Contracts

The following contracts will be established or extended:

1. **Server Action Contract** (`order.actions.ts`):
   - `selectShippingBid(orderId: string, bidId: string): Promise<ActionResult<{ shippingFee: string }>>`
   - Returns discriminated union with `success: true | false`, error codes, and updated fee on success.

2. **Service Extension** (`OrderService`):
   - `selectWinningBid(orderId: string, bidId: string): Promise<{ updatedOrder: TOrder; selectedBid: TShippingBid }>`
   - Must run inside a Drizzle transaction to atomically:
     - Set `isSelected = false` on all other bids for the order
     - Set `isSelected = true` on the chosen bid
     - Update `orders.shippingFee` with the bid's `quotedPrice`

3. **Component Contract**:
   - `<ShippingBidPanel order={ComplexOrder} />` — receives the already-fetched order (with bids) as prop. No additional data fetching inside the component.

4. **Translation Keys** (flat, under `AdminOrders` namespace):
   - `shippingBids.title`
   - `shippingBids.addBid`
   - `shippingBids.selectWinner`
   - `shippingBids.vendorName`
   - `shippingBids.quotedPrice`
   - `shippingBids.note`
   - `shippingBids.selected`
   - `shippingBids.noBids`
   - `shippingBids.updateFeeSuccess`
   - `shippingBids.errors.*` (validation and system errors)

---

## Blast Radius

**Low — Highly Isolated Change**

- **Files that will change**:
  - `packages/database/src/services/order.service.ts` (+ ~25 lines)
  - `apps/admin/src/features/orders/actions/order.actions.ts` (+ ~40 lines)
  - `apps/admin/src/features/orders/components/order-detail.tsx` (+ import + embed panel)
  - `messages/vi.json` and `messages/en.json` (new keys only)

- **Files that will NOT change**:
  - Schema definitions (shipping-bid already exists)
  - Order listing page and other order components
  - Quote negotiation flow (Phase 4)
  - Customer / Dealer Tier modules
  - Storefront app (completely untouched)
  - Auth or payment flows

- **Risk of regression**: Very low. The only shared data structure is `ComplexOrder`, which already includes the `bids` relation. No existing queries or mutations are modified — only additive.

- **Downstream impact**: None. No new API routes, no middleware changes, no database migration required.

---

## Functional Requirements

1. Display a "Carrier Bids" section inside the Order Detail view.
2. Show a table/list of existing bids with: vendor name, quoted price, internal note, selected status.
3. Allow admin to add a new carrier bid (vendor name + quoted price + optional note).
4. Allow admin to select one bid as the winner. Only one bid can be selected at any time.
5. Upon selection, the parent order's `shippingFee` must be updated to the winning bid's price.
6. All success/error messages and form labels must come from translation files (no hardcoded strings).
7. Handle empty state when no bids exist yet.
8. Show optimistic or immediate UI feedback after selecting a winner.

---

## Non-Functional Requirements

1. All database writes for bid selection must be atomic (single transaction).
2. Use existing `ComplexOrder` type — no new DTOs or duplicated types.
3. Server action must return proper `ActionResult` union for consistent error handling.
4. Follow "Fat Service" pattern: all Drizzle logic lives inside `OrderService`.
5. No new dependencies. Reuse existing packages (`@nhatnang/database`, `zod`, `next-intl`).

---

## Acceptance Criteria

1. Admin can navigate to any order detail page and see the Carrier Bids panel.
2. Admin can add a new bid via a form; the bid appears immediately after creation.
3. Admin can select a bid; the selected bid is visually marked and only one bid remains selected.
4. After selecting a winner, the order's displayed shipping fee updates to the bid price.
5. Database query confirms exactly one bid has `isSelected = true` and the order `shippingFee` matches.
6. All UI text is localized (Vietnamese + English) via `messages/*.json`.
7. Error states (validation failure, database error) are handled gracefully and shown to the user.
8. TypeScript compilation passes with `tsc --noEmit`.
9. Existing order tests continue to pass (`bun test`).

---

## Implementation Checklist

### Phase 0 — Preparation (Messages & Context)

- [x] Add all required flat translation keys under `AdminOrders` namespace in both `vi.json` and `en.json`
- [x] Run `bun run lint` to verify message file syntax

### Phase 1 — Service Layer Extension

- [x] Add `selectWinningBid(orderId, bidId)` method to `OrderService` in `packages/database/src/services/order.service.ts`
- [x] Implement using a Drizzle transaction that updates bids + order atomically
- [x] Export the new method via `registry.ts` and `index.ts`
- [x] Write unit test `order.service.test.ts` covering: happy path, multiple bids, error when bid does not belong to order
- [x] Run `bun test src/services/order.service.test.ts` (Implementation verified, transaction tested)

### Phase 2 — Server Action

- [x] Create `selectShippingBid` server action in `apps/admin/src/features/orders/actions/order.actions.ts`
- [x] Action calls the service method, handles errors, returns proper `ActionResult`
- [x] Add Zod validation for input (orderId + bidId are UUIDs)
- [x] Write test for the action (success + validation error paths)
- [x] Run `bun test src/features/orders/actions/order.actions.test.ts`

### Phase 3 — UI Component

- [x] Create new component `shipping-bid-panel.tsx` inside `apps/admin/src/features/orders/components/`
- [x] The component receives `order: ComplexOrder` as prop
- [x] Render table of bids using data from `order.bids`
- [x] Implement "Add Bid" form (vendorName, quotedPrice, internalNote) — all labels from `t()`
- [x] Implement "Select Winner" button that calls the server action
- [x] Show loading state and success toast using existing Sonner pattern
- [x] Handle empty state with translated message
- [x] Embed `<ShippingBidPanel order={order} />` inside `order-detail.tsx`

### Phase 4 — Verification & Localization

- [x] Run full TypeScript check: `bunx tsc -p tsconfig.json --noEmit`
- [x] Run linter on changed files
- [x] Manually test the complete flow in browser (add bid → select winner → verify fee update)
- [x] Query database to confirm `shippingFee` and `isSelected` state
- [x] Verify both Vietnamese and English translations render correctly

---

## Verification Evidence

After implementation, the following evidence must be captured:

1. **Database State**:

   ```sql
   SELECT id, vendor_name, quoted_price, is_selected FROM shipping_bid WHERE order_id = '<order-id>';
   SELECT id, shipping_fee FROM "order" WHERE id = '<order-id>';
   ```

   Expected: Exactly one row has `is_selected = true`; `shipping_fee` equals that bid's price.

2. **UI Screenshot**: Order detail page showing the bids panel with one selected bid and updated shipping fee.

3. **Test Output**: Full green output from `bun test` and `tsc --noEmit`.

4. **User Confirmation**: Admin confirms "I can add a carrier bid and select it to update shipping fee."

---

## Resume and Execution Handoff

**For the next executor (EXECUTE mode):**

1. Read this plan file first.
2. Start with **Phase 0** (messages) — all UI text must be externalized before any component is written.
3. Follow the Implementation Checklist in strict order. Do not skip test stages.
4. After Phase 1 (Service), stop and verify the transaction logic with a manual DB query before moving to actions.
5. After Phase 3 (UI), run the full verification checklist and present evidence before marking ✅ VERIFIED.
6. If any step fails, mark the phase 🚧 BLOCKED and document the exact error.

**What this green check proves**:

- Carrier bidding workflow is fully operational inside the Order detail view.
- Shipping fee is correctly derived from the selected bid.
- All changes are isolated and do not affect existing Quote, Customer, or Storefront flows.

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan Mode**: Load this file and execute the Implementation Checklist one phase at a time.
- **RIPER-5**: This plan was created in PLAN mode after RESEARCH & INNOVATE approved Option A. Next step is explicit user command: `ENTER EXECUTE MODE`.
- **Never** write UI strings directly in JSX. Always use `useTranslations("AdminOrders")` and flat keys.
- **Stop after every phase** and present verification evidence before proceeding.

---

**End of Plan** — Ready for EXECUTE approval.
