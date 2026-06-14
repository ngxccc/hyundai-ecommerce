# Storefront Cart UI Integration - Design Specification

**Date**: 2026-06-14
**Status**: APPROVED (User-selected Recommended Options)
**Scope**: Storefront Cart UI Components & Page Integration

---

## 1. Overview

This document specifies the detailed design for Phase 3 of the shopping cart system. Following the completion of the database service layer, persistent Zustand client store, and Next.js Server Actions, this spec details the integration of:

1. A **Header Cart Popover** (Desktop dropdown & Mobile redirect) with a **Hydration-Safe Skeleton Badge**.
2. An **Add to Cart Button** on the product catalog grid cards.
3. A dedicated **Cart Page** layout (`/cart`) with list, quantity selector, order summary, and dummy Checkout/Quoting actions.

---

## 2. Aesthetics & Design System Alignments

The visual representation must strictly align with the **Hyundai Classic** preset defined in `process/context/uxui/design-hyundai.md`:

- **Corners**: Base border radius `--radius: 0.125rem` (2px). UI elements (cards, popovers) use `rounded-lg` (2px) and buttons use `rounded-md` (1.6px).
- **Typography**: Product details use `font-sans` (Inter). Prices, quantities, SKUs, and subtotals must render in `font-mono` (JetBrains Mono).
- **Interactive Highlights**: Backdrop blur (`backdrop-blur-md` with `bg-background/80`) is standard on floating sheets and popovers.

---

## 3. Detailed Component Designs

### 3.1. Header Cart Popover (`apps/storefront/src/features/home/components/header.tsx`)

- **Visuals**: A Shopping Cart icon (`ShoppingCart` from Lucide) placed next to the login/register buttons in the desktop actions area.
- **Mobile Viewport (Responsive UX - Approved)**:
  - On viewports `< 768px` (mobile/tablet), the Popover is disabled. Clicking the icon redirects the user directly to the `/cart` page via `Link`.
- **Desktop Viewport (Radix Popover)**:
  - On viewports `>= 768px`, hovering or clicking the icon opens a Radix Popover showing a scrollable list (max height `240px`) of up to 5 items in the cart.
  - Each item displays: 50x50 thumbnail image, name (localized based on current locale), quantity, and subtotal.
  - A bottom actions card contains a full-width primary button labeled "View Full Cart" linking to `/cart`.
- **Skeleton Loader (Hydration Guard - Approved)**:
  - To prevent layout shifts (visual jumps) and React hydration mismatch warnings, the badge overlay (which displays the item count) renders a pulsing gray skeleton dot before mounting:
    ```tsx
    // Pre-mount / SSR fallback
    <span className="bg-muted/40 absolute -top-1 -right-1 flex h-5 w-5 animate-pulse rounded-full" />
    ```
  - Once mounted (`isMounted === true`), it renders the real item count badge:
    ```tsx
    // Post-mount client rendering
    <Badge className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 font-mono text-[10px] font-bold">
      {totalItemsCount}
    </Badge>
    ```

### 3.2. Add to Cart Button (`apps/storefront/src/features/products/components/add-to-cart-button.tsx`)

- **Architecture**: A Client Component wrapping the add-to-cart trigger logic, imported by the Server Component `CatalogTemplate`.
- **Inputs (Props)**:
  ```typescript
  interface AddToCartButtonProps {
    productId: string;
    name: string;
    price: string;
    image: string;
    totalStock: number;
    isQuoteOnly: boolean;
  }
  ```
- **Interaction (Approved)**:
  - Renders only for buyable products (`isQuoteOnly: false`).
  - Displays stacked under or side-by-side with "Buy Now" inside `CardFooter`. Designed as a secondary outline button (`variant="outline"`) with a plus (`+`) icon and text "Add to Cart".
  - Clicking the button checks the Zustand store quantity. If adding 1 exceeds `totalStock`, a toast notification warns: _"Cannot add more items. Maximum stock reached."_.
  - Otherwise, it adds the item to the client store (optimistic update), calls `addToDbCartAction(productId, 1)` asynchronously if logged in, and displays a success toast: _"Added [Product Name] to cart."_.

### 3.3. Dedicated Cart Page (`apps/storefront/app/[locale]/(shop)/cart/page.tsx`)

- **Route**: Exposed publicly at `/cart`, matching the storefront's general router layout.
- **Borders & Shell**:
  - Two-column grid on desktop, stacking vertically on mobile.
  - Left Column (List): Card container containing the items list. Shows localized name, price (in `font-mono`), custom quantity adjustment buttons (`-` and `+`), and a "Remove" button.
  - Right Column (Order Summary): Card showing Subtotal, estimated tax/shipping, and two CTA buttons: "Proceed to Checkout" (Primary) and "Request Quote" (Outline).
- **Stock Limit UX (Approved)**:
  - The increment button (`+`) inside the `QuantitySelector` is disabled when `quantity === totalStock` to prevent users from exceeding available stock.
- **Dummy CTA Warnings (Approved)**:
  - Clicking "Proceed to Checkout" or "Request Quote" displays a standard toast notification: _"Checkout and quoting features are coming soon in Phase 4."_.
- **Mount Safeguard**:
  - The entire page body uses a custom `isMounted` state. While `!isMounted`, it displays standard skeleton blocks (Product card skeletons on the left, order summary card skeleton on the right) to avoid any flash of unhydrated state.

---

## 4. Data Flow & Syncing Invariants

1. **Local and Server Alignment**:
   - The Zustand store `useCartStore` acts as the source of truth for the UI components.
   - Operations perform local optimistic updates instantly to keep the UI snappy.
   - If the session is authenticated (authenticated `userId` is present), the Server Actions are fired in the background. If a server action fails (e.g. database error, network timeout), the UI store reverts the change and displays an error toast.

2. **Login Merge Action**:
   - On successful authentication inside `login-form.tsx`, `mergeLocalCartAction` is dispatched with all items currently stored in the client store.
   - Once the server verifies the merge is complete, the client store clears its local storage and fetches the final merged database cart items to initialize the state.

---

## 5. Security & Stock Constraints

- **Stock validation**: Database and server actions enforce that `quantity <= totalStockCache`. If a user manually changes local storage or bypasses client-side checks, any subsequent server-side mutation or validation rejects the operation.
- **Quote-Only Products**: Products marked with `isQuoteOnly: true` are prohibited from being added to the cart, enforced by both client-side UI filters and server-side action checks.
