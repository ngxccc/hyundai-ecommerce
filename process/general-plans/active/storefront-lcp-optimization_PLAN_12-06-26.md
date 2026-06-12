# Storefront LCP Optimization Plan

**Date**: June 12, 2026
**Complexity**: SIMPLE
**Status**: ⏳ PLANNED

---

## Overview

Optimize the Largest Contentful Paint (LCP) metric on the storefront by compressing system icons (`apple-icon.png`, `icon.png`) and ensuring critical above-the-fold product images use `priority` and `loading="eager"` attributes.

---

## Touchpoints

- `apps/storefront/app/apple-icon.png`
- `apps/storefront/app/icon.png`
- `apps/storefront/src/features/products/components/catalog-template.tsx`
- `apps/storefront/src/shared/components/image-with-skeleton.tsx`

---

## Public Contracts

No new public APIs. Changes are internal performance optimizations.

---

## Blast Radius

- Image file size reduction affects initial page load.
- Adding `priority` to `next/image` components affects which images are preloaded by the browser.

---

## Implementation Checklist

### Phase 1: Image Compression & Priority
- [ ] Compress `apple-icon.png` to under 30KB using sharp-cli (target 180x180)
- [ ] Compress `icon.png` to under 200KB (target 512x512)
- [ ] Add `priority={index < 3}` and `loading="eager"` to the first 3 product cards in `catalog-template.tsx`
- [ ] Verify no LCP warnings in browser console on `/products` and homepage

---

## Verification Evidence

- Run `bun turbo run build --filter=storefront` and confirm no LCP-related warnings in build output.
- Manual browser test on `http://localhost:3000/products` showing LCP under 2.5s on fast 3G.

---

## Resume and Execution Handoff

After implementation, update the ROADMAP item to `[x]` with link to this plan.

Next step: Proceed to `storefront-catalog-caching-migration_PLAN_12-06-26.md`.
