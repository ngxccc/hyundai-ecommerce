# Storefront LCP Image Optimization Plan

**Date**: June 12, 2026
**Status**: ✅ VERIFIED

---

## Overview

Optimize the Largest Contentful Paint (LCP) on storefront pages by compressing system icons (`apple-icon.png`, `icon.png`) and ensuring the first few product images in catalog grids use `priority` and `loading="eager"`.

---

## Touchpoints

- `apps/storefront/app/apple-icon.png`
- `apps/storefront/app/icon.png`
- `apps/storefront/src/features/products/components/catalog-template.tsx`
- `apps/storefront/src/shared/components/image-with-skeleton.tsx`

---

## Public Contracts

No new public contracts. Changes are performance optimizations only.

---

## Blast Radius

- Reducing icon file sizes improves initial load time.
- Adding `priority` to `next/image` affects preload behavior for the first 3 product cards.

---

## Implementation Checklist

### Phase 1: Icon Compression

- [x] Compress `apple-icon.png` to ~180x180px and under 30KB using sharp-cli
- [x] Compress `icon.png` to 512x512px and under 200KB

### Phase 2: Above-the-fold Image Priority

- [x] In `catalog-template.tsx`, add `priority={index < 3}` and `loading="eager"` to the first row of product cards (grid 3 columns)
- [x] Ensure `ImageWithSkeleton` correctly forwards these props to `next/image`

### Phase 3: Verification

- [x] Run production build and confirm no LCP warnings
- [x] Manual browser test on `/products` page

## Phase Completion Rules

Every phase defined in this plan must be verified before advancing:

1. Type Safety: `bun turbo run check-types --filter=storefront` must pass.
2. Lint: `bun run lint --filter=storefront` must pass with zero warnings.
3. Build: Production build must succeed without LCP warnings.

## Acceptance Criteria

- AC 1: `apple-icon.png` is under 30KB and 180x180px.
- AC 2: `icon.png` is under 200KB and 512x512px.
- AC 3: First 3 product cards in catalog use `priority` and `loading="eager"`.
- AC 4: No LCP warnings appear in browser console on `/products`.

---

## Verification Evidence

- Lighthouse or browser DevTools shows LCP < 2.5s on fast 3G for catalog pages.
- Build succeeds without image-related warnings.

---

## Resume and Execution Handoff

After completion, mark the corresponding roadmap item as done and link this plan.

**Next**: Refactor `getStaticProductSlugs` into the cached service layer.
