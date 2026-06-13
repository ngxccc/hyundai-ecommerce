# Phase 3: Cart Service & Storefront Integration — Plan

**Date**: 08-06-26
**Complexity**: Simple
**Status**: 🔨 IN PROGRESS

## Overview

This plan details the implementation of a client-first, hybrid shopping cart system for the B2B Storefront application using **Zustand** (with `localStorage` persistence) for guest sessions and **PostgreSQL** (via `CartService` in `@nhatnang/database`) for authenticated sessions.

Rather than polluting the PostgreSQL database with anonymous guest carts (which leads to table bloat and high write amplification), guest carts will live exclusively in the browser's `localStorage`. Upon successful authentication, the local guest cart items are merged atomically into the user's permanent database cart. All database operations check stock limits against `totalStockCache` in transactions.

Unlike mobile-first consumer apps that use sliding drawers, this B2B storefront will integrate a dedicated, full-featured **Cart Page** at the `/cart` route, matching the layout structure of other storefront routes.

This phase follows the database and coding guidelines in `process/context/all-context.md` and testing procedures in `process/context/tests/all-tests.md` (specifically `tests.md` routing).

---

## Quick Links

- [Phase 3: Cart Service \& Storefront Integration — Plan](#phase-3-cart-service--storefront-integration--plan)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [Goals and Success Metrics](#goals-and-success-metrics)
  - [Phase Completion Rules](#phase-completion-rules)
  - [Execution Brief](#execution-brief)
    - [Phase 1: Database Cart Service Refinement](#phase-1-database-cart-service-refinement)
    - [Phase 2: Client-side Zustand Store \& Server Actions](#phase-2-client-side-zustand-store--server-actions)
    - [Phase 3: Storefront Cart Page \& Header Integration](#phase-3-storefront-cart-page--header-integration)
    - [Expected Outcome](#expected-outcome)
  - [Scope](#scope)
  - [Assumptions and Constraints](#assumptions-and-constraints)
  - [Functional Requirements](#functional-requirements)
  - [Non-Functional Requirements](#non-functional-requirements)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Implementation Checklist](#implementation-checklist)
  - [Risks and Mitigations](#risks-and-mitigations)
  - [Integration Notes](#integration-notes)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Verification Evidence](#verification-evidence)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## Goals and Success Metrics

- **Goals**:
  - Implement a persistent Zustand store (`useCartStore`) for managing client-side cart state under `apps/storefront/src/features/cart/hooks/use-cart.ts`.
  - Simplify `CartService` in `@nhatnang/database` to only manage authenticated carts in PostgreSQL.
  - Create atomic Server Actions for cart CRUD and cart merging.
  - Create a dedicated **Cart Page** at `apps/storefront/app/[locale]/(shop)/cart/page.tsx` displaying selected items, quantities, and B2B checkout/quoting CTA.
  - Connect the global Header navigation to link to the `/cart` page with a dynamic count badge.
- **Success Metrics**:
  - Zero guest/anonymous carts saved in PostgreSQL database (0% DB bloat for guest sessions).
  - Cart merge flow executes in `< 50ms` upon successful login.
  - 100% type safety and zero typescript errors.

---

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

After each phase, document:

- [ ] What was tested manually
- [ ] Data verified in DB (show query + result)
- [ ] Errors encountered and fixed
- [ ] User confirmation received

---

## Execution Brief

### Phase 1: Database Cart Service Refinement

**What happens**: Define `ICartService` and refine `CartService` in `@nhatnang/database`. Since guest carts are stored in `localStorage`, `CartService` is simplified to only require a valid `userId` for cart creation. The `mergeCarts` method is refined to `mergeLocalItems(userId: string, localItems: { productId: string, quantity: number }[])` which receives local items and inserts/updates them atomically inside a transaction.

- **Test**: Run unit tests in `packages/database/src/services/cart/cart.service.test.ts` to assert that `getOrCreateCart`, `addToCart`, `updateCartItemQuantity`, and `mergeLocalItems` operate correctly.
- **Verify**: Run `bun test packages/database/src/services/cart/cart.service.test.ts`.
- **Done when**: All package tests pass and the database service layer compiled cleanly.

### Phase 2: Client-side Zustand Store & Server Actions

**What happens**: Implement the persistent Zustand store `apps/storefront/src/features/cart/hooks/use-cart.ts` using Zustand's `persist` middleware to automatically read/write to `localStorage`. Create Next.js server actions in `apps/storefront/src/features/cart/actions.ts` (`getDbCart`, `addToDbCart`, `updateDbQuantity`, `removeFromDbCart`, `mergeLocalCart`). Integrate the cart merge flow into `login-form.tsx` so that it calls `mergeLocalCart` on successful login and clears the local store.

- **Test**: Add items to cart as guest, log in, and verify that items are successfully transferred to PostgreSQL and the local storage is cleared.
- **Verify**: Check `localStorage` state in devtools and query the `cart_item` database table to verify records.
- **Done when**: User session transitions sync guest items to DB seamlessly.

### Phase 3: Storefront Cart Page & Header Integration

**What happens**: Build the dedicated Cart Route page (`apps/storefront/app/[locale]/(shop)/cart/page.tsx`) and its template component (`apps/storefront/src/features/cart/components/cart-template.tsx`). The page displays cart items, quantities, and prices, and includes increment/decrement buttons with stock-limit validations. Integrate `useIsClient` to prevent Next.js hydration mismatches. Link the cart icon in the `Header` to `/cart` and display the dynamic count badge. Wire "Add to Cart" buttons on product catalog pages.

- **Test**: Open the `/cart` page, update quantities, delete items, and try adding items beyond the product's `totalStockCache` (assert UI blocks the action and shows validation toast).
- **Verify**: Verify manual flows on both desktop and mobile viewports.
- **Done when**: Dedicated `/cart` page behaves correctly, shows instant optimistic updates, and disables increment button when quantity reaches available stock.

### Expected Outcome

- Zero database storage overhead for guest carts.
- Sub-millisecond guest cart updates locally via LocalStorage.
- Automatic, transactional cart merging on user login.
- A fully integrated, responsive Cart Page at `/cart`.

---

## Scope

**In Scope**:

- Update `CartService` database layer to focus purely on authenticated user sessions.
- Implement the client-side Zustand cart store with `localStorage` persistence under `apps/storefront/src/features/cart/hooks/use-cart.ts`.
- Next.js server actions to handle authenticated database cart mutations.
- Merge action integration in the client-side login form callback.
- UI components: `CartTemplate`, dedicated `/cart` page route, Add to Cart buttons, and Header badge.
- Hydration guards using `useIsClient`.

**Out of Scope**:

- Implementing full Checkout wizard and payment gateways (Phase 4 scope).
- Quote request negotiation portal (Phase 4 scope).

---

## Assumptions and Constraints

- Users have a maximum of 1 active cart in the database (enforced by unique constraint on `userId` in `carts` table).
- Guest carts are stored entirely on the client side in browser `localStorage`.
- Product stock availability is checked against `totalStockCache` in the `product` table.
- A product having `isQuoteOnly: true` cannot be added to the shopping cart.

---

## Functional Requirements

- **Local Persistence**: Guest cart items must persist across page reloads and browser tab closes.
- **Merge Logic**: On login, guest items are sent to the server. If a product already exists in the user's DB cart, the quantities are summed up (capped at available stock cache). If not, it is created. The guest cart in local storage is cleared immediately after a successful merge.
- **Real-time Stock Guard**: The quantity selector in the drawer must read the product's `totalStockCache` and disable the increment button (`+`) when `quantity === totalStock`.
- **Hydration Guard**: Cart badge and item cards must render only on the client side after mounting to avoid Next.js hydration mismatches.

---

## Non-Functional Requirements

- **Database Performance**: Zero write load on PostgreSQL for anonymous guest shopping sessions.
- **Page Load Performance**: Synchronous LocalStorage reads ensure the cart badge is rendered immediately on the client without API loading states.
- **UI Responsiveness**: Deletions and quantity updates are reflected instantly on the UI.

---

## Acceptance Criteria

- [x] `CartService` methods only require `userId` and do not generate anonymous cart rows in PostgreSQL.
- [ ] Zustand store `useCartStore` uses `persist` middleware to manage guest items in `localStorage`.
- [ ] Logging in with local items triggers `mergeLocalCart` Server Action and runs updates inside a transaction.
- [ ] Logging out clears the client-side store.
- [ ] Header cart icon displays correct total items count dynamically and links to `/cart`.
- [ ] Dedicated `/cart` page displays product names, images, prices, quantities, and calculates the total price correctly.
- [ ] Quantity selectors block inputs higher than the available stock cache.
- [ ] All workspaces compile cleanly with zero TypeScript errors or warnings.

---

## Implementation Checklist

- [x] Update interface `ICartService` in `packages/database/src/services/interfaces.ts` to replace guest cart flows with `mergeLocalItems`.
- [x] Modify `packages/database/src/services/cart/cart.service.ts` to implement `mergeLocalItems(userId, localItems)`.
- [x] Update service tests in `packages/database/src/services/cart/cart.service.test.ts` to cover `mergeLocalItems`.
- [x] Run `bun test` in `@nhatnang/database` package to verify service tests are green.
- [ ] Create Zustand store in `apps/storefront/src/features/cart/hooks/use-cart.ts` with local storage persistence.
- [ ] Create Server Actions in `apps/storefront/src/features/cart/actions.ts` (`getDbCart`, `addToDbCart`, `updateDbQuantity`, `removeFromDbCart`, `mergeLocalCart`).
- [ ] Update `LoginForm` component in `apps/storefront/src/features/auth/components/login-form.tsx` to invoke `mergeLocalCart` on successful login and clear local cart state.
- [ ] Implement `CartTemplate` UI page layout in `apps/storefront/src/features/cart/components/cart-template.tsx`.
- [ ] Implement dedicated `/cart` page route in `apps/storefront/app/[locale]/(shop)/cart/page.tsx` with hydration safety (`useIsClient`).
- [ ] Update `Header` component in `apps/storefront/src/features/home/components/header.tsx` to include cart trigger button and badge linking to `/cart`.
- [ ] Add "Add to Cart" buttons to product catalog page (`apps/storefront/src/features/products/components/catalog-template.tsx`).
- [ ] Run `bun run check-types` across workspaces to confirm 100% type safety.
- [ ] Manually test end-to-end: adding as guest, merging on login, quantity limits, and stock checks.

---

## Risks and Mitigations

- **Risk**: Local storage data is manipulated by the user.
  - _Mitigation_: The server validates all quantities, product availability, and stock cache during checkout or quote request creation, rejecting invalid payloads.
- **Risk**: Hydration mismatch between Server and Client HTML.
  - _Mitigation_: Wrap cart components with `useIsClient` guards to ensure they are rendered client-side only.

---

## Integration Notes

- **Database**: Modifies `cart` and `cart_item` tables for authenticated users.
- **State Persistence**: Uses browser `localStorage` under key `cart-storage` via Zustand store.
- **Translations**: Standard translation keys for cart alerts and labels added in `vi.json` and `en.json`.

---

## Touchpoints

- `packages/database/src/services/interfaces.ts`
- `packages/database/src/services/cart/cart.service.ts`
- `packages/database/src/services/cart/cart.service.test.ts`
- `apps/storefront/src/features/cart/actions.ts` (new)
- `apps/storefront/src/features/cart/hooks/use-cart.ts` (new)
- `apps/storefront/src/features/cart/components/cart-template.tsx` (new)
- `apps/storefront/app/[locale]/(shop)/cart/page.tsx` (new)
- `apps/storefront/src/features/home/components/header.tsx`
- `apps/storefront/src/features/products/components/catalog-template.tsx`
- `apps/storefront/src/features/auth/components/login-form.tsx`
- `apps/storefront/messages/vi.json`
- `apps/storefront/messages/en.json`

---

## Public Contracts

- **Server Actions**:
  - `mergeLocalCart(localItems: { productId: string, quantity: number }[])` returning `{ success: boolean, error?: string }`
  - `addToDbCart(productId: string, quantity: number)` returning `{ success: boolean, error?: string }`
- **Local Storage Key**: `cart-storage`.

---

## Blast Radius

- **Storefront App**: Localized to the cart feature directory, `/cart` route, and header integration. No regression impact on catalogs page reading.
- **Authentication Forms**: Adds a post-login side effect to merge local items.
- **Database Service Layer**: Simplified cart service, reducing Postgres load.

---

## Verification Evidence

- Run typechecks:

  ```bash
  bun run check-types
  ```

- Run unit tests:

  ```bash
  bun test packages/database/src/services/cart/cart.service.test.ts
  ```

- Manual Verification:
  - Add items as guest, verify `localStorage` contains items.
  - Log in, verify `mergeLocalCart` is called, Postgres updates, and `localStorage` is cleared.
  - Assert incrementing items beyond stock limits is blocked.

---

## Resume and Execution Handoff

When entering execution mode, start by adjusting `ICartService` and `CartService` in `@nhatnang/database` to focus purely on authenticated user sessions and replace anonymous cart logic with `mergeLocalItems`. Once the database layer is verified green via `bun test`, proceed to storefront server actions, auth merge callback integration, Zustand store, and UI page/template components.

---

## Cursor + RIPER-5 Guidance

- Use Cursor Plan mode: import this checklist.
- RIPER-5: RESEARCH → INNOVATE → PLAN, then request EXECUTE.
- Avoid code until EXECUTE.
- **After each phase: STOP and verify before proceeding.**

Next Step: ENTER EXECUTE MODE on storefront-phase-3-cart-service_PLAN_08-06-26.md.
