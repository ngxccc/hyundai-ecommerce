# B2B Storefront Program — Program Goal Charter

**Date**: 08-06-26  
**Complexity**: Complex  
**Status**: ⏳ PLANNED

## Overview

Transition the B2B Storefront application from static mock data to a fully database-driven, performance-optimized, and transactional catalog and quoting experience. This enables dealers and contractors to browse product catalogs, manage shopping carts, submit quote requests, and participate in B2B price negotiation workflows directly integrated with the CRM backend.

This program references the repository context router at `process/context/all-context.md` and database context guidelines at `process/context/database/all-database.md`.

---

## Phase Completion Rules

- **Phase 1 (Mock Migration)**: Complete when all storefront product/category API endpoints fetch from the database.
- **Phase 2 (Product Catalog)**: Complete when search, sorting, and filter components fetch database records dynamically.
- **Phase 3 (Cart Service)**: Complete when `CartService` is implemented in `packages/database` and integrated into the storefront.
- **Phase 4 (Customer Portal)**: Complete when quoting flows and customer portals are fully operational.

---

## Acceptance Criteria

- All mock endpoints in `/api/products` and `/api/categories` are replaced with database calls.
- The `/products` catalog listing page displays products dynamically with search and filters.
- A functional B2B cart allows guest/authenticated user cart merging.
- A customer portal page at `/quotes` permits B2B quote submission and timeline negotiation.

---

## Implementation Checklist

- [x] Execute Phase 1 plan (API migration).
- [ ] Execute Phase 2 plan (Product catalog, sorting, and filters).
- [ ] Execute Phase 3 plan (Cart service implementation).
- [ ] Execute Phase 4 plan (Customer portal and quote negotiation timeline).

---

## Touchpoints

- `apps/storefront/app/api/products/route.ts`
- `apps/storefront/app/api/categories/route.ts`
- `apps/storefront/app/[locale]/products/page.tsx`
- `packages/database/src/services/cart.service.ts`
- `apps/storefront/app/[locale]/quotes/page.tsx`

---

## Public Contracts

- `/api/products` and `/api/categories` endpoints.
- `CartService` dynamic public methods.
- URL parameters: `/products?category=valves&sort=price_asc&q=gate`.

---

## Blast Radius

- High impact on Storefront front-end views and APIs.
- Medium impact on database service layer.
- Zero impact on CRM Admin Dashboard functionality.

---

## Verification Evidence

- Automated and manual tests documented under `process/context/tests/all-tests.md`.
- Compilation verification using `tsc --noEmit`.
- Workspace-wide unit testing using `bun test`.

---

## Resume and Execution Handoff

- Proceed sequentially through each phase plan file in the feature directory.
- Run E2E test verification after each phase.

Next Step: ENTER EXECUTE MODE on storefront-phase-1-api-migration_PLAN_08-06-26.md.
