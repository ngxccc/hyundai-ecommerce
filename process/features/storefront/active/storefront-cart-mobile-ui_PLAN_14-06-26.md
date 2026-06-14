# Storefront Cart Mobile UI Optimization - Plan

**Date**: 14-06-26
**Complexity**: Simple
**Status**: CODE DONE

## Overview

Optimize the storefront shopping cart page (`cart-template.tsx`) for mobile devices. Currently, the cart item card layout collapses into a vertically stacked, centered layout that is tall and difficult to scan on smaller screens. We will restructure the mobile layout into a compact, row-based layout and integrate a sticky bottom summary/action bar on mobile devices (`< 768px` screens) to enable immediate access to checkout and quoting.

We refer to the authoritative codebase entrypoints in `process/context/all-context.md` and verification guidelines in `process/context/tests/all-tests.md`.

## Design Specification

### 1. Visual Layout & User Experience

#### A. Mobile Cart Item Card (Compact Row-Based Grid)

On screens narrower than `768px` (Tailwind `< md:`), each cart item card shifts from the desktop horizontal row to a compact 2-column flex or grid layout:

- **Left Column (Fixed Width):** Product image / `ProductImagePlaceholder` with fixed dimensions of `w-20 h-20` (`size-20`) and rounded corners (`rounded`).
- **Right Column (Flex-1):** Left-aligned vertical layout containing:
  - Product name (font-sans, bold, text-sm, truncated).
  - Unit price (`font-mono`, text-xs, text-muted-foreground).
  - A bottom control row containing:
    - The quantity selector (minus button, number input, plus button) with thin borders and minimal padding.
    - A trash button (icon only) floated to the right of the quantity selector to keep it visually separated.

```
+-----------------------------------------------------+
| +----------+  Tên sản phẩm Generator Model X        |
| |  [Image] |  $1,500.00 (font-mono)                 |
| |  (size-20|                                        |
| +----------+  [-] [ 2 ] [+]              [Trash Icon] |
+-----------------------------------------------------+
```

#### B. Mobile Sticky Bottom Summary & Action Bar

- On screens `< 768px`, the main "Order Summary" card remains at the bottom of the page flow, but we add a sticky bottom navigation/summary bar at the bottom of the viewport (`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-zinc-200 p-4 shadow-lg`).
- **Layout:**
  - **Left Side:** A summary label displaying the total items in `font-sans` and the total price in `font-mono` (e.g. `Total (2 items): $3,000.00`).
  - **Right Side:** A primary action button (either "Proceed to Checkout" or "Request Quote" based on requirements, default to "Checkout" to trigger the `comingSoon` toast).
- To prevent the sticky bar from overlaying the last item in the cart list, a spacer `div` (`h-24 md:hidden`) is appended at the very bottom of the page content.

### 2. Styling & Design Invariants (Hyundai Classic)

- **Border Radius:** Card base border radius must be `--radius: 0.125rem` (2px). Button components must use `rounded-md` (1.6px).
- **Typography:** Prices, quantity inputs, subtotal fields, and totals must render in `font-mono` (JetBrains Mono).
- **Backdrop Blur:** The sticky bottom bar uses `bg-background/90 backdrop-blur-md` for visual polish.

### 3. Localization (i18n)

- Keys for "Total Items", "Subtotal", and "Total" reuse existing `Cart` namespace localization keys:
  - `Cart.totalItems`
  - `Cart.subtotal`
  - `Cart.total`
- No new localization key additions are required as all keys are already present.

---

## Phase Completion Rules

- A phase is considered complete only when all checklist tasks under it are completed, and verified via `bun run check-types` and `bun run lint` passing successfully.
- Code modification is only complete when visual and responsive layout shifts conform exactly to the design specifications on simulated viewport sizes.

---

## Scope

**In-Scope:**

- Responsive redesign of cart item card (Method 1) in `cart-template.tsx`.
- Mobile sticky bottom bar (Method 3) in `cart-template.tsx`.
- Applying `font-mono` styling on data labels, price values, and totals.
- Strict compliance with Hyundai Classic border-radius specifications.

**Out-of-Scope:**

- Adding new routes or database schema changes.
- Modifying client/server cart synchronizations or state management.

---

## Functional Requirements

1.  **Mobile Cart Item Card:**
    - Display product image (left) and product information + actions (right).
    - Use left-alignment on mobile instead of current center-alignment.
2.  **Mobile Sticky Bottom Bar:**
    - Float fixed at the bottom of the viewport.
    - Render dynamic total count and formatted total price (`font-mono`).
    - Trigger Checkout action on click.

---

## Acceptance Criteria

1.  ✅ Cart page compiles successfully without TypeScript errors.
2.  ✅ Tailwind v4 responsive classes correctly style the mobile layout (`< md:` / `< 768px`).
3.  ✅ Border radius on cards and buttons matches Hyundai Classic specifications.
4.  ✅ Prices, quantity inputs, total items, and order totals are displayed in `font-mono`.
5.  ✅ Linter checks pass with 0 errors/warnings.

---

## Implementation Checklist

### Phase 1: UI Refactor

- [x] **Step 1: Modify `cart-template.tsx` card content grid**
      Update `apps/storefront/src/features/cart/components/cart-template.tsx` to support compact responsive card layout.
      Change the card container from:
      `<CardContent className="flex flex-col items-center gap-6 p-4 sm:flex-row">`
      to a grid/flex layout that does not center items on mobile:
      `<CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:gap-6">`
      Ensure the right side content (name and details) aligns left on mobile:
      `<div className="min-w-0 flex-1 text-left">`

- [x] **Step 2: Adjust Image sizing & structure**
      Ensure the product image container has:
      `<div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded">` (prevent shrink-0 on mobile).

- [x] **Step 3: Lay out mobile controls and quantity selector**
      Reorganize the quantity selector and delete button to sit on a single line on mobile:
      `<div className="flex w-full items-center justify-between gap-4 mt-2 sm:w-auto sm:mt-0">`
      This floats the delete button to the right and keeps the quantity picker on the left.

- [x] **Step 4: Implement Mobile Sticky Bottom Bar**
      Add the sticky summary bar at the end of `CartTemplate`:
      `tsx
    {/* Sticky Bottom Bar for Mobile */}
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-background/90 p-4 shadow-lg backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">{t("totalItems")}: <span className="font-mono font-semibold text-foreground">{totalCount}</span></span>
          <span className="font-mono text-lg font-bold text-foreground">
            {priceFormatter.format(subtotal)}
          </span>
        </div>
        <Button rounded="md" className="rounded-md px-6 py-2 text-sm font-semibold" onClick={handleActionClick}>
          {t("checkout")}
        </Button>
      </div>
    </div>
    `

- [x] **Step 5: Add bottom spacer**
      Add a spacer `div` below the main content list to avoid overlay issues on mobile:
      `<div className="h-24 md:hidden" />`

### Phase 2: Quality & Verification

- [x] **Step 6: Check compilation & types**
      Run: `bun run check-types`
      Verify 0 errors.

- [x] **Step 7: Check linting**
      Run: `bun run lint`
      Verify 0 errors.

- [x] **Step 8: Run Validation Script**
      Run: `node .claude/skills/ag-generate-plan/scripts/validate-plan-artifact.mjs process/features/storefront/active/storefront-cart-mobile-ui_PLAN_14-06-26.md`

- [x] **Step 9: Sync to Roadmap**
      Run: `node .claude/skills/ag-generate-plan/scripts/update-roadmap.mjs process/features/storefront/active/storefront-cart-mobile-ui_PLAN_14-06-26.md`

- [x] **Step 10: Commit Plan File**
      Stage and commit the newly created plan file.

---

## Touchpoints

- `apps/storefront/src/features/cart/components/cart-template.tsx`
- `process/features/storefront/active/storefront-cart-mobile-ui_PLAN_14-06-26.md`

---

## Public Contracts

- There are no public contract shifts. We preserve existing Zustand actions and service APIs.

---

## Blast Radius

- Minimal. Changes are localized strictly inside the `CartTemplate` component in `apps/storefront/src/features/cart/components/cart-template.tsx`.

---

## Verification Evidence

- Run type checking: `bun run check-types`
- Run linting: `bun run lint`

---

## Resume and Execution Handoff

Upon plan approval, ENTER EXECUTE MODE to apply changes starting with Step 1 of the checklist.
