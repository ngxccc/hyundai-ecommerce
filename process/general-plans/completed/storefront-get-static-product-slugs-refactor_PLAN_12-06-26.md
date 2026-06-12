# Storefront getStaticProductSlugs Refactor Plan

**Date**: June 12, 2026
**Status**: ✅ VERIFIED

---

## Overview

Move any remaining raw or direct database access for fetching active product slugs into the centralized cached `productService.getStaticProductSlugs()` function, ensuring full compliance with Next.js 16 Cache Components.

---

## Touchpoints

- `apps/storefront/app/sitemap.ts`
- `apps/storefront/src/shared/services/product.service.ts`
- Any other files still calling database slug functions directly

---

## Public Contracts

- `productService.getStaticProductSlugs(): Promise<string[]>` — must be wrapped with `"use cache"` and `cacheLife("days")`.

---

## Blast Radius

- Affects sitemap generation and any static path generation relying on product slugs.

---

## Implementation Checklist

### Phase 1: Service Layer

- [ ] Ensure `productService.getStaticProductSlugs()` in `apps/storefront/src/shared/services/product.service.ts` is the single source of truth and uses cache
- [ ] Remove any direct `dbProductService.getAllActiveSlugs()` calls outside the shared service

### Phase 2: Call Site Update

- [ ] Update `sitemap.ts` (if not already done) to exclusively use the cached service

### Phase 3: Verification

- [ ] Confirm `/sitemap.xml` is generated as static/partial prerender
- [ ] Run `validate-plan-inventory.mjs` and ensure zero missing plan link failures for this item

---

## Phase Completion Rules

Every phase defined in this plan must be verified before advancing:

1. Type Safety: `bun turbo run check-types --filter=storefront` must pass.
2. Lint: `bun run lint --filter=storefront` must pass with zero warnings.
3. Build: `/sitemap.xml` must not be marked as dynamic (`ƒ`).

## Acceptance Criteria

- AC 1: `productService.getStaticProductSlugs()` is the single source of truth and uses `"use cache"`.
- AC 2: No direct calls to `dbProductService.getAllActiveSlugs()` remain outside shared services.
- AC 3: `/sitemap.xml` generates as static or partial prerender route.

## Verification Evidence

- Build output shows sitemap as non-dynamic route.
- No raw database imports for slug fetching remain in storefront catalog code.

---

## Resume and Execution Handoff

This plan, together with `storefront-catalog-caching-migration_PLAN_12-06-26.md`, completes the catalog caching milestone.

**Next**: Bilingual database schema migration.
