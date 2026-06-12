# Storefront Catalog Caching Migration Plan

**Date**: June 12, 2026
**Complexity**: SIMPLE
**Status**: ✅ VERIFIED

---

## Overview

Complete the migration of all raw database service calls in the storefront catalog domain (sitemap generation, product metadata API, product listing, and filters) into a centralized cached service layer under `apps/storefront/src/shared/services/`. This ensures full compliance with Next.js 16 `"use cache"` and Cache Components model.

---

## Touchpoints

**Files modified**:
- `apps/storefront/app/sitemap.ts`
- `apps/storefront/app/api/products/metadata/route.ts`
- `apps/storefront/app/api/products/route.ts`
- `apps/storefront/src/features/products/components/catalog-template.tsx`
- `apps/storefront/src/shared/services/product.service.ts`
- `apps/storefront/src/shared/services/category.service.ts`
- `apps/storefront/src/shared/services/brand.service.ts` (new)
- `apps/storefront/src/shared/services/index.ts`

**New files**:
- `apps/storefront/src/shared/services/brand.service.ts`

---

## Public Contracts

- `productService.getStaticProductSlugs()` — returns cached list of active product slugs
- `productService.getFiltersMetadata()` — returns cached filter metadata
- `categoryService.getCategories()`, `getCategoryTree()`, `getCategoryDescendants()`
- `brandService.getBrands()`

All functions are wrapped with `"use cache"` + `cacheLife("hours")` or `cacheLife("days")`.

---

## Blast Radius

- Affects static generation of `/sitemap.xml`
- Affects response of `/api/products/metadata` and `/api/products`
- Changes how `CatalogTemplate` fetches data (now goes through cached storefront layer instead of direct database import)

---

## Implementation Checklist

### Phase 1: Create Cached Service Wrappers
- [x] Create `brand.service.ts` with `getBrands()` wrapped in cache
- [x] Extend `category.service.ts` with `getCategoryTree()` and `getCategoryDescendants()`
- [x] Ensure `product.service.ts` already exposes `getStaticProductSlugs()` and `getFiltersMetadata()` with cache

### Phase 2: Migrate Call Sites
- [x] Update `sitemap.ts` to use `categoryService.getCategories()` and `productService.getStaticProductSlugs()`
- [x] Update `api/products/metadata/route.ts` to use `productService.getFiltersMetadata()`
- [x] Update `api/products/route.ts` to use storefront `categoryService`, `brandService`, and `productService`
- [x] Update `catalog-template.tsx` to import from `@/shared/services` instead of `@nhatnang/database/services`

### Phase 3: Test & Audit
- [x] Run typecheck + lint
- [x] Run production build and confirm `/sitemap.xml` and `/api/products/metadata` are no longer dynamic (`ƒ`)
- [x] Verify `validate-plan-inventory.mjs` reports zero "missing plan link" failures for these items

---

## Verification Evidence

- Build output shows:
  ```
  ○ /sitemap.xml                                             1d      1w
  ○ /api/products/metadata                                   1h      1d
  ```
  (no `ƒ` dynamic marker)
- All direct imports of runtime services from `@nhatnang/database/services` in catalog files have been removed (only type imports and internal wrappers remain).

---

## Resume and Execution Handoff

This plan completes the roadmap items:
- Migrate raw database queries into storefront cached service layers
- Refactor getStaticProductSlugs to fetch via Database productService.getAllActiveSlugs()

**Next**: Proceed with bilingual database schema migration (`multilingual-db-and-dto-architecture_PLAN_12-06-26.md`).

**Note on auth.service.ts**: The current implementation is only a re-export. Adding `"use cache"` to auth operations is intentionally avoided because login/register are dynamic, rate-limited, and session-creating actions that must not be cached.
