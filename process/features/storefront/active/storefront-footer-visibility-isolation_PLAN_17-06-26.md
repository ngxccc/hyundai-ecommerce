# Storefront Footer Visibility Isolation - Plan

**Date:** 17-06-26  
**Complexity:** Simple  
**Status:** ⏳ PLANNED

## Overview
Isolate the `<Footer />` component in the storefront application so it only renders on shopper-facing pages (home page `/`, product pages `/products/*`, cart `/cart`) and is hidden on portal screens (`/portal/*`) and auth screens (`/login`, `/register`). We will use Next.js route groups (`(shop)` and `(portal)`) to structure layout nesting natively and declaratively.

## Quick Links
- [Goals and Success Metrics](#goals-and-success-metrics)
- [Execution Brief](#execution-brief)
- [Acceptance Criteria](#acceptance-criteria)
- [Implementation Checklist](#implementation-checklist)

## Goals and Success Metrics
* **Goal**:
  - Exclude `<Footer />` from all portal dashboard paths (`/portal/*`) and auth paths (`/login`, `/register`).
  - Keep `<Footer />` visible on home (`/`), products (`/products/*`), and cart (`/cart`).
  - Avoid any client-side route tracking or dynamic hooks (`usePathname`) for the layout adjustment.
* **Success Metrics**:
  - Accessing `/` displays the footer.
  - Accessing `/portal/profile` does NOT display the footer.
  - Accessing `/login` does NOT display the footer.
  - TypeScript compiles with zero errors, and all existing tests pass successfully.

---

## Execution Brief
This is a SIMPLE, single-session plan. Implement the phases continuously.

### Phase 1: Directory Restructuring
- **What happens**: Move the home page `page.tsx` into the `(shop)` route group, and move the `portal` directory from the `(shop)` route group to a new `(portal)` route group.
- **Verification**: Files are in their correct locations, git status reflects the moves correctly.

### Phase 2: Layout Updates
- **What happens**: Create a custom layout file for `(shop)` which renders the `<Footer />` component. Modify the main root layout `app/[locale]/layout.tsx` to remove the global `<Footer />` rendering.
- **Verification**: Compilation check passes.

### Phase 3: Post-Implementation Verification
- **What happens**: Run type checks, tests, and verify layout behavior across pages.
- **Verification**: Clean typecheck and passing tests.

---

## Scope
* **In-Scope**:
  - Restructuring `page.tsx` (home) and `portal/` folder.
  - Creating `(shop)/layout.tsx` and editing `app/[locale]/layout.tsx`.
* **Out-of-Scope**:
  - Any modifications to the `<Footer />` layout internals.
  - Restructuring header navigation or general authentication route guards.

---

## Acceptance Criteria
1. ✅ `<Footer />` is rendered on the Home page (`/`), Products catalog (`/products`), and Cart page (`/cart`).
2. ✅ `<Footer />` is NOT rendered on any Portal page (`/portal/*`) or Auth page (`/login`, `/register`).
3. ✅ Monorepo TypeScript check (`bun run check-types`) passes.
4. ✅ Test suites (`bun run test`) pass with no errors.

---

## Implementation Checklist

### Phase 1: Directory Restructuring
1. [ ] Move `apps/storefront/app/[locale]/page.tsx` to `apps/storefront/app/[locale]/(shop)/page.tsx`.
2. [ ] Move the entire `apps/storefront/app/[locale]/(shop)/portal/` directory to `apps/storefront/app/[locale]/(portal)/portal/`.

### Phase 2: Layout Configuration
3. [ ] Create layout file `apps/storefront/app/[locale]/(shop)/layout.tsx` which renders:
   ```tsx
   import { Footer } from "@/features/home/components";

   export default function ShopLayout({ children }: { children: React.ReactNode }) {
     return (
       <>
         {children}
         <Footer />
       </>
     );
   }
   ```
4. [ ] Modify `apps/storefront/app/[locale]/layout.tsx` to remove:
   - The `Footer` import from `import { Header, Footer } from "@/features/home/components";`.
   - The `<Footer />` component rendering from the layout body.

### Phase 3: Post-Implementation Testing
5. [ ] Run type check to ensure no issues: `bun run check-types`.
6. [ ] Run tests to ensure test coverage compiles and passes: `bun run test`.
