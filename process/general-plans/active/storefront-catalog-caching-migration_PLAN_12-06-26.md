# Storefront Catalog Caching Migration Plan

**Date**: June 12, 2026
**Complexity**: SIMPLE
**Status**: ⏳ PLANNED

---

## Overview

Complete the migration of all remaining raw database queries in the storefront catalog layer (sitemap, metadata API, and static slug generation) into the cached service layer under `@/shared/services`. This ensures full compatibility with Next.js 16 Cache Components and PPR.

---

## Touchpoints

- `apps/storefront/app/sitemap.ts`
- `apps/storefront/app/api/products/metadata/route.ts`
- `apps/storefront/src/shared/services/product.service.ts` (specifically `getStaticProductSlugs`)
- `apps/storefront/src/features/products/components/catalog-template.tsx` (indirectly)

---

## Public Contracts

- `productService.getStaticProductSlugs()` must be fully cached and return only active product slugs.

---

## Blast Radius

- Changes affect static generation of sitemap.xml and product metadata endpoint.
- Any regression here will break SEO and client-side filtering.

---

## Implementation Checklist

### Phase 1: Slug Resolution
- [ ] Move any remaining raw SQL or direct Drizzle queries for product slugs into `productService.getStaticProductSlugs()` in the storefront shared service layer.
- [ ] Ensure the function uses `"use cache"` + `cacheLife("days")`.
- [ ] Update `sitemap.ts` to rely exclusively on the cached service.

### Phase 2: Verification
- [ ] Run `bun turbo run build --filter=storefront` and confirm `/sitemap.xml` and `/api/products/metadata` are no longer marked as dynamic (`ƒ`).
- [ ] Verify no direct imports from `@nhatnang/database/services` remain in catalog-related files outside the shared services wrappers.

---

## Verification Evidence

- Both `/sitemap.xml` and `/api/products/metadata` must appear as static or partial prerender routes in the build output.
- Audit script `validate-plan-inventory.mjs` must report zero "ROADMAP task missing plan link" failures for these items.

---

## Resume and Execution Handoff

This plan completes the "Migrate raw database queries..." and "Refactor getStaticProductSlugs..." roadmap items.

After completion, mark both items as done in `process/ROADMAP.md`.
