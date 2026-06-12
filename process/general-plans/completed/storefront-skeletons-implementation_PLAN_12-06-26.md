# Storefront Skeleton Components Implementation Plan

**Date**: June 12, 2026
**Complexity**: COMPLEX (UI/UX Refactoring)
**Implementation Approach**: Shared @nhatnang/ui Skeleton + Local Feature Skeletons
**Execution Model**: Phase-by-Phase with Visual Audits and Typecheck Validation
**Status**: ✅ VERIFIED

---

## Overview

This implementation plan outlines the integration of the newly added `@nhatnang/ui/components/ui/skeleton` component into the storefront application. We will replace empty loading fallbacks (`fallback={null}`) with animated skeleton loaders (using Tailwind's `animate-pulse` and `bg-accent` base styles). This eliminates layout shifts (CLS), improves Google Core Web Vitals, and provides a polished, smooth loading experience for our customers.

This plan relies on the repository context defined in `process/context/all-context.md`.

---

## Touchpoints

- **UI Package (`packages/ui`)**:
  - `packages/ui/src/components/ui/skeleton.tsx` (base skeleton component)
- **Storefront App (`apps/storefront`)**:
  - `apps/storefront/src/features/products/components/catalog-template.tsx` (product catalog templates)
  - `apps/storefront/src/features/products/components/active-filter-chips.tsx` (filter chips fallback)
  - `apps/storefront/src/features/products/components/product-pagination.tsx` (pagination fallback)
  - `apps/storefront/app/[locale]/(shop)/products/[slug]/page.tsx` (product detail page fallback)
  - `apps/storefront/app/[locale]/page.tsx` (homepage async sections fallback)
  - `apps/storefront/src/features/auth/components/auth-page-shell.tsx` (auth pages fallback)

---

## Public Contracts

### Base Skeleton Component Contract

We will import the shared `Skeleton` component from the monorepo UI package:

```typescript
import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";
```

### Storefront Custom Skeletons

We will create storefront-specific reusable skeleton components under `apps/storefront/src/shared/components/skeletons/` (or locally in feature folders):

1. **`ProductCardSkeleton`**:
   - Simulates a grid item of the product catalog.
   - Matches the dimensions of the actual `<Card />` in `products-section.tsx`.
2. **`NewsCardSkeleton`**:
   - Simulates a grid item of the news section.
3. **`CatalogTemplateSkeleton`**:
   - Combines a sidebar filter skeleton, a sorting header skeleton, and a grid of 6 `ProductCardSkeleton` items.

---

## Blast Radius

- **Storefront Page Shells & CSS Layouts**:
  - If skeleton dimensions (height, padding, gap) do not exactly match the actual rendered component, it will still trigger minor Cumulative Layout Shifts (CLS) during transition.
  - Styles inside `packages/ui` must be fully resolved in both Light and Dark modes.

---

## Phase Completion Rules

Every phase defined in this plan must be verified and checked in full before advancing:

1. **Types Safety**: Running `bun turbo run check-types` must succeed with zero TypeScript compiler errors.
2. **Layout Integrity**: The page layout must remain stable (no visual shifting) during component rendering.
3. **Post-Phase Testing**: Verify that client-side hydration completes with zero browser console errors.

---

## Acceptance Criteria

- **AC 1: Shared Package Utilization**: All new skeleton components import and use the base `Skeleton` component from `@nhatnang/ui`.
- **AC 2: Catalog Page (Zero-CLS)**: The `/products` catalog and `/products/category/[slug]` pages render a structured grid skeleton during initial loading and filter transitions.
- **AC 3: Homepage PPR Streaming**: The homepage `/` streams dynamic sections (`ProductsSection`, `NewsSection`, `CategoriesSection`) using matching skeleton cards, allowing the main static layout (Hero, Header) to load instantly.
- **AC 4: Auth Shell Visuals**: The authentication pages (`/login` and `/register`) render card and input skeletons during loading instead of a generic text box.
- **AC 5: Build Integrity**: Storefront production compilation and static parameters generation compile with zero errors.

---

## Implementation Checklist

### Phase 1: Shared UI Mapping & Reusable Card Skeletons

- [ ] Verify that `@nhatnang/ui` exports the `Skeleton` component correctly.
- [ ] Create `ProductCardSkeleton` inside `apps/storefront/src/features/products/components/skeletons/product-card-skeleton.tsx`:
  - Show skeleton image block (aspect-square), skeleton text rows for title and model, and a skeleton button.
- [ ] Create `NewsCardSkeleton` inside `apps/storefront/src/features/home/components/skeletons/news-card-skeleton.tsx`.

### Phase 2: Catalog Page & Category Pages Skeletons

- [ ] Create `CatalogTemplateSkeleton` showing a layout matching `<CatalogTemplate />`.
- [ ] Replace `fallback={null}` in `/products/page.tsx` and `products/category/[slug]/page.tsx` with `CatalogTemplateSkeleton`.
- [ ] Add `ActiveFilterChipsSkeleton` and `ProductPaginationSkeleton` fallbacks inside `catalog-template.tsx`.

### Phase 3: Homepage PPR Streaming Skeletons

- [ ] Refactor `apps/storefront/app/[locale]/page.tsx` to wrap:
  - `<CategoriesSection />` in `<Suspense fallback={<CategoriesSectionSkeleton />}>`.
  - `<ProductsSection />` in `<Suspense fallback={<ProductsSectionSkeleton />}>` (reusing `ProductCardSkeleton`).
  - `<NewsSection />` in `<Suspense fallback={<NewsSectionSkeleton />}>` (reusing `NewsCardSkeleton`).

### Phase 4: Product Detail Page & Auth Shell Skeletons

- [ ] Create `ProductDetailsSkeleton` showing a large product image placeholder and text line placeholders.
- [ ] Replace `fallback={null}` in `app/[locale]/(shop)/products/[slug]/page.tsx` with `ProductDetailsSkeleton`.
- [ ] Update `AuthPageLoadingFallback` in `auth-page-shell.tsx` to use the `Skeleton` component to render input-field blocks.

---

## Verification Evidence

Validation and testing instructions are aligned with the guidelines in `process/context/tests/all-tests.md` and `tests.md`:

### 1. Compilation Verification

Verify typecheck across the storefront package:

```bash
bun turbo run check-types --filter=storefront
```

Must compile with zero errors.

### 2. Build & Static Generation Verification

Run production builds:

```bash
bun turbo run build --filter=storefront
```

Must compile and pre-render all static and partial-prerender (PPR) pages successfully.

---

## Resume and Execution Handoff

1. Locate this plan at `process/general-plans/active/storefront-skeletons-implementation_PLAN_12-06-26.md`.
2. Ensure you have consulted `process/context/all-context.md` before making changes.
3. Start with **Phase 1: Shared UI Mapping & Reusable Card Skeletons** by creating the storefront skeletons using the base `@nhatnang/ui/components/ui/skeleton` component.
4. Run the post-phase testing verification gates after each phase.

**Next Step**: None. Implementation and verification completed.
