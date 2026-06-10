# Plan: B2B Storefront Phase 2 - Static Category Routes

Convert category catalog views from dynamic search query parameters (`/products?category=slug`) to statically optimized route parameters (`/products/category/[slug]`). This enables Next.js to pre-render (SSG) all category pages at build time for optimal FCP/LCP and peak SEO indexing.

## Touched Files

1. `apps/storefront/app/[locale]/(shop)/products/category/[slug]/page.tsx` (New): Static category catalog page with `generateStaticParams`.
2. `apps/storefront/src/features/products/components/product-filters.tsx`: Update category selection to navigate to path-based category routes.
3. `apps/storefront/app/api/products/route.ts`: Update API handler to resolve brand slugs to IDs.
4. `apps/storefront/app/[locale]/(shop)/products/page.tsx`: Update page handler to resolve brand slugs to IDs.

## Detailed Plan

### 1. Create `products/category/[slug]/page.tsx`
Create the page component mirroring `app/[locale]/(shop)/products/page.tsx` but resolving the category slug from path parameter `params.slug` instead of `searchParams.category`.
- Implement `generateStaticParams()` by calling `categoryService.getAll()` to pre-render all categories.
- Enable Incremental Static Regeneration (ISR) with `export const revalidate = 3600`.
- Resolve child category IDs using `categoryService.getCategoryDescendants`.
- Fetch products under the resolved categories using `productService.getAll`.
- Pass `selectedCategorySlug={slug}` to `ProductFilters`.

### 2. Update `product-filters.tsx`
- Add `selectedCategorySlug?: string` to `ProductFiltersProps`.
- Resolve `selectedCategory` using the prop or fallback to `searchParams.get("category")`.
- Rewrite the `onClick` category tree node handler:
  - If selected, click redirects to `/products` with current search params.
  - If not selected, click redirects to `/products/category/${node.slug}` with current search params.
- Sync `selectedBrands` checklist states and filters by using `brand.slug` instead of `brand.id`.

### 3. Verification & Testing
- Run typescript compilation checks (`bun run check-types` at workspace root).
- Run database package unit tests (`bun run test` in `packages/database`).
- Execute production build check (`bun run build --filter=storefront`) to verify `/products/category/[slug]` is compiled as a static SSG route (`●`).

## Handoff & Resume
Execution will begin immediately after user reviews and approves this plan.
