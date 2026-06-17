# Storefront Footer Visibility Design Spec

* **Date**: 2026-06-17
* **Status**: Approved
* **Feature**: storefront

## Background
Currently, the `<Footer />` component is rendered inside the root layout file `app/[locale]/layout.tsx`, which forces it to display globally across all routes. This includes portal dashboards (`/portal/*`) and authentication pages (`/login`, `/register`), which typically benefit from a cleaner layout without a generic footer.

## Goals
1. Hide the e-commerce footer on all customer portal pages (`/portal/*`) and login/registration pages (`/login`, `/register`).
2. Retain the footer on the home page (`/`), products pages (`/products/*`), and the cart page (`/cart`).
3. Maintain fully server-side rendering (SSR/SSG) without relying on client-side hooks like `usePathname()` to toggle layout visibility.

## Proposed Solution (Option B: Next.js Native Route Groups)
We will leverage Next.js App Router's route groups to structure layouts declaratively:

1. **Remove Footer from Root Layout**:
   - Edit `apps/storefront/app/[locale]/layout.tsx` to remove the `<Footer />` component reference.

2. **Establish Shop Layout Group**:
   - Create `apps/storefront/app/[locale]/(shop)/layout.tsx`.
   - This layout will wrap all shopper-facing pages and render `<Footer />` at the bottom of the page content.
   - Move the root page `apps/storefront/app/[locale]/page.tsx` to `apps/storefront/app/[locale]/(shop)/page.tsx` so the home page receives the footer.
   - Note: Products (`/products`) and Cart (`/cart`) are already physically under the `(shop)` directory.

3. **Establish Portal Layout Group**:
   - Move the portal folder `apps/storefront/app/[locale]/(shop)/portal` to a new group: `apps/storefront/app/[locale]/(portal)/portal`.
   - Since `(portal)` is a separate route group, pages under `/portal` will inherit the root layout (with header/toaster/providers) but will not inherit the `(shop)` layout (which contains the footer).

## Affected Files
* `apps/storefront/app/[locale]/layout.tsx` (Modify to remove `<Footer />`)
* `apps/storefront/app/[locale]/(shop)/layout.tsx` (Create to render `<Footer />`)
* `apps/storefront/app/[locale]/page.tsx` (Move to `apps/storefront/app/[locale]/(shop)/page.tsx`)
* `apps/storefront/app/[locale]/(shop)/portal/*` (Move to `apps/storefront/app/[locale]/(portal)/portal/*`)

## Verification Plan
1. **Compilation**: Run `bun run check-types` across the monorepo to verify that there are no broken relative imports or compilation issues.
2. **Unit Tests**: Run `bun run test` to verify that there are no test suite regressions.
3. **Manual Route Verification**: Check that `/`, `/products`, `/cart` resolve properly with the footer, and `/portal/*`, `/login`, `/register` resolve without the footer.
