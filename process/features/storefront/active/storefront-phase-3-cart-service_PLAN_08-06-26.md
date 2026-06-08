# Phase 3: Cart Service & Storefront Integration — Plan

**Date**: 08-06-26  
**Complexity**: Simple  
**Status**: ⏳ PLANNED

## Overview

Implement `CartService` in `packages/database` and integrate it with the Storefront to allow adding products to a persistent shopping cart, quantity changes, stock validation, and merging guest carts to logged-in user profiles.

This phase follows the database standards specified in `process/context/all-context.md`.

---

## Phase Completion Rules

* Complete when `CartService` methods are fully implemented, tested, and integrated with the storefront UI.
* Concurrency and transactional tests pass with zero errors.

---

## Acceptance Criteria

- `CartService` handles B2B cart creation, adding, updating, and removing cart items.
- Cart items merge seamlessly from guest profiles to authenticated user profiles on login.
- Quantities are validated against warehouse stock availability.

---

## Implementation Checklist

- [ ] Write `CartService` with core crud and merge operations.
- [ ] Register `CartService` in `packages/database/src/services/registry.ts`.
- [ ] Connect storefront sliding panel to cart APIs.

---

## Touchpoints

- `packages/database/src/services/cart.service.ts`
- `packages/database/src/services/registry.ts`
- `apps/storefront/src/features/cart/`

---

## Public Contracts

- `CartService` public method signatures and interface.
- Cart REST API / Server Action contracts.

---

## Blast Radius

- Medium impact on database service layer.
- Localized to cart schema tables.

---

## Verification Evidence

- Write and run unit tests in `packages/database/src/services/cart.service.test.ts`.
- Verify database state updates match verification rules in `process/context/tests/all-tests.md`.
- Compile safety check using `tsc --noEmit`.

---

## Resume and Execution Handoff

* Examine the consolidated `cart` and `cart_item` schemas.
* Develop cart operations using transaction-safe query blocks.
* Integrate UI states and test flow end-to-end.

Next Step: ENTER EXECUTE MODE on storefront-phase-3-cart-service_PLAN_08-06-26.md.
