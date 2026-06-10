# Storefront Hybrid Faceted Search Implementation Plan

**Date**: 10-06-26
**Complexity**: COMPLEX (Standard Complex)
**Feature**: Storefront Catalog Filters
**Status**: ⏳ PLANNED

---

## Quick Links

- [Storefront Hybrid Faceted Search Implementation Plan](#storefront-hybrid-faceted-search-implementation-plan)
  - [Quick Links](#quick-links)
  - [Overview](#overview)
  - [Phase Completion Rules](#phase-completion-rules)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Implementation Checklist](#implementation-checklist)
  - [Execution Brief](#execution-brief)
    - [Phase 1: Database Service \& API Route Setup](#phase-1-database-service--api-route-setup)
    - [Phase 2: Client-side Facet Engine](#phase-2-client-side-facet-engine)
    - [Phase 3: Client Component Integration](#phase-3-client-component-integration)
  - [Scope](#scope)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
  - [Blast Radius](#blast-radius)
  - [Verification Evidence](#verification-evidence)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## Overview

This plan implements a **Hybrid Faceted Search** mechanism for the storefront product catalog. The core problem is that traditional server-side facet grouping (e.g. running heavy `GROUP BY` queries on a JSONB column) incurs high CPU overhead on the database and creates lag in user interaction. This implementation aligns with the coding and architecture guidelines defined in `process/context/all-context.md`.

Our solution is to load a static-cached, lightweight JSON metadata file representing all active products. Client-side Javascript executes facet-matching in <1ms on RAM, instantly disabling checkboxes for invalid filter paths, while the actual product list (images, prices, name) continues to render server-side (supporting SEO) and updates via standard paginated server transitions.

---

## Phase Completion Rules

A phase is **NOT** complete until:

1. **Type Checking** — All workspaces (`storefront`, `database`, `types`) pass `bun run check-types` or `tsc --noEmit`.
2. **Unit Tests** — API route and client-side facet engine pass tests.
3. **Manual Verification** — The filters on desktop (live mode) and mobile (sheet mode) correctly disable/enable checkbox options based on current selection, and never lead to a "No products found" page unless the initial search query is invalid.

---

## Acceptance Criteria

- The `/api/products/metadata` route is implemented, statically cached (`revalidate = 3600`), and returns the lightweight metadata of all active products correctly.
- A fast client-side facet engine evaluates matching combinations in memory in `< 1ms` on user input changes.
- Incompatible filter checkbox options are instantly disabled on both desktop and mobile viewports, preventing "zero-results" states.
- Filter state, active selections, and page cursors are correctly synchronized with the URL.
- Hydration issues or infinite rendering loops on URL parameter updates are prevented.
- Standard React components are typed correctly and ESLint warnings are clean.

---

## Implementation Checklist

- [ ] Modify `IProductService` interface in `packages/database/src/services/interfaces.ts`.
- [ ] Implement `getFiltersMetadata` in `ProductService` (`packages/database/src/services/product.service.ts`).
- [ ] Create API route `/api/products/metadata` in `apps/storefront/app/api/products/metadata/route.ts`.
- [ ] Write API route tests in `apps/storefront/app/api/products/metadata/route.test.ts`.
- [ ] Create `facet-engine.ts` client-side calculator utility in `apps/storefront/src/features/products/utils/facet-engine.ts`.
- [ ] Write engine unit tests in `apps/storefront/src/features/products/utils/facet-engine.test.ts`.
- [ ] Fetch metadata JSON dynamically and cache it in component state on initial catalog load.
- [ ] Integrate facet engine calculations into `ProductFilters` to disable invalid options.
- [ ] Verify functionality and execute performance check of client memory matching.

---

## Execution Brief

### Phase 1: Database Service & API Route Setup

**Goal**: Extend `ProductService` to fetch lightweight product specifications metadata and expose it via a static-cached API route `/api/products/metadata`.

1. **Interface Update**: Add `getFiltersMetadata` to `IProductService` in `packages/database/src/services/interfaces.ts`.
2. **Service Implementation**: Implement `getFiltersMetadata()` in `packages/database/src/services/product.service.ts` to fetch `id`, `categoryId`, `brandId`, and `specs` for all active (non-deleted) products using Drizzle `select()`.
3. **API Route**: Create `apps/storefront/app/api/products/metadata/route.ts`:
   - Fetch metadata from the service.
   - Configure a static generation cache window using `export const revalidate = 3600;`.
4. **API Route Test**: Create `apps/storefront/app/api/products/metadata/route.test.ts` to assert that it returns valid JSON with correct properties and the static headers configuration.

**Verification**:

- Run `bun test apps/storefront/app/api/products/metadata/route.test.ts` to verify API response.

---

### Phase 2: Client-side Facet Engine

**Goal**: Build a pure-JS facet calculator that computes checkbox disabled states based on the active selection and the cached metadata.

1. **Facet Engine Utility**: Create `apps/storefront/src/features/products/utils/facet-engine.ts`.
2. **Logic**:
   - Filter active products based on selected categories (including descendants) and brand selections.
   - For each spec filter (power, fuelType, phase, voltage, engineBrand, alternatorBrand):
     - Compute the subset of products matching _all other active filters_.
     - Extract available option values from that subset.
     - Mark checkboxes that have 0 matching options as disabled.
3. **Unit Tests**: Create `apps/storefront/src/features/products/utils/facet-engine.test.ts` with diverse mock product arrays to verify correctness of dynamic disabling.

**Verification**:

- Run `bun test apps/storefront/src/features/products/utils/facet-engine.test.ts`.

---

### Phase 3: Client Component Integration

**Goal**: Integrate the facet engine into the `ProductFilters` component to disable invalid options.

1. **Hydration / Fetching**:
   - Fetch `/api/products/metadata` inside `CatalogTemplate` or `ProductFilters` once during page mount using `useEffect` (or fetch on parent and pass as prop). Keep it in local state.
2. **Checkbox Disabling**:
   - Call the facet engine with the current selection state (both URL params and pending selections in mobile sheet mode).
   - Dynamically disable checkboxes when the facet engine evaluates them as invalid (having 0 potential matches).
3. **Maintain User Actionability**:
   - A checkbox that is _currently checked_ must never be disabled, allowing the user to uncheck it and reset their query path.
4. **State Sync & Transition Guard**:
   - Ensure the Next.js `startTransition` or debounced router update handles rapid selections smoothly without locking the UI or causing infinite loops.

**Verification**:

- Verify manual operation in desktop "live" mode and mobile "sheet" mode.
- Confirm that checking a mutually exclusive brand instantly disables invalid engine/alternator brands before the server response returns.

---

## Scope

**In Scope**:

- Schema and interface changes to expose metadata.
- Static-cached API route `/api/products/metadata` with 1-hour revalidation cache.
- Pure client-side facet engine utility and its test suite.
- Integration into `ProductFilters` for responsive desktop and mobile drawers.
- Dynamic disabling/enabling of specifications, brand, and category checkboxes.

**Out of Scope**:

- Complex server-side database aggregations (`GROUP BY`) on the catalog page.
- Splitting metadata downloads per category (V1 global download is sufficient for size ~50KB).

---

## Touchpoints

- `packages/database/src/services/interfaces.ts`
- `packages/database/src/services/product.service.ts`
- `apps/storefront/app/api/products/metadata/route.ts` (new)
- `apps/storefront/app/api/products/metadata/route.test.ts` (new)
- `apps/storefront/src/features/products/utils/facet-engine.ts` (new)
- `apps/storefront/src/features/products/utils/facet-engine.test.ts` (new)
- `apps/storefront/src/features/products/components/product-filters.tsx`
- `apps/storefront/src/features/products/components/catalog-template.tsx`

---

## Public Contracts

- API Endpoint: `GET /api/products/metadata` returning:

  ```json
  {
    "status": true,
    "data": [
      {
        "id": "uuid",
        "categoryId": "uuid-or-null",
        "brandId": "uuid-or-null",
        "specs": {
          "power": 100,
          "voltage": 400,
          "phase": "3phase",
          "fuelType": "diesel",
          "engineBrand": "Hyundai",
          "alternatorBrand": "Hyundai"
        }
      }
    ]
  }
  ```

---

## Blast Radius

- **Storefront Search & Catalog Page**: Major behavioral improvement. Filters will now update dynamic states immediately.
- **Database Load**: Reduced significantly by avoiding dynamic count queries during pagination transitions.
- **Payload/Bandwidth**: Minor increase (~50KB) on initial catalog page load.

---

## Verification Evidence

- Follow the testing procedures defined in `process/context/tests/all-tests.md` (specifically `tests.md` routing) to execute verification.
- Run typechecks:

  ```bash
  bun run check-types
  ```

- Run unit/integration tests:

  ```bash
  bun test apps/storefront/app/api/products/metadata/route.test.ts
  bun test apps/storefront/src/features/products/utils/facet-engine.test.ts
  ```

- Visual QA on mobile (375px) and desktop (1440px) to verify immediate disabling of invalid filters (Post-Phase Testing / Test Procedure).

---

## Resume and Execution Handoff

When entering execution mode, start by modifying the `IProductService` interface in `packages/database/src/services/interfaces.ts` and the `ProductService` class implementation in `packages/database/src/services/product.service.ts` to implement `getFiltersMetadata()`. Then build the API route and the facet engine utility.

---

## Cursor + RIPER-5 Guidance

Next Step: Review this plan. If approved, reply with `ENTER EXECUTE MODE` (or request modifications). The first execution phase will be **Phase 1: Database Service & API Route Setup**.
