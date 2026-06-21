# Mobile Order Detail Design Specification

- **Date**: 2026-06-21
- **Feature**: B2B Checkout & Roles Refactor (Storefront)
- **Scope**: Responsive / Mobile layout optimization for the Order Detail view (`/portal/orders/[id]`).

---

## Layout Strategy

### Grid Reorganization (Single-Column on Mobile)
On viewport sizes below `md` (768px), the desktop 3-column layout collapses into a single vertical column. The order of components is rearranged to prioritize user actions:
1. **Header**: Title, Order ID, creation date, status badges.
2. **Order Progress Stepper**: Stepper showing stages from Pending to Delivered.
3. **B2B / Cancellation Alerts**: Dynamic notification banners.
4. **Action Widgets**: PayOS redirect widget, Cash payment instructions, cancellation action buttons.
5. **Order Items**: Product names, unit prices, quantities, and line item subtotals.
6. **Buyer & Delivery Information**: Shipping address and buyer profile cards.
7. **Transaction History**: List of associated payment transactions.
8. **Price Summary**: Financial breakdown (subtotal, shipping fee, VAT, final total amount).

---

## Component Optimizations

### 1. OrderItemsTable (`order-items-table.tsx`)
- **Desktop**: Grid-based `Table` showing columns: Product, Unit Price, Quantity, Subtotal.
- **Mobile**: Vertical stack of items inside a `divide-y divide-zinc-100` layout:
  - Product name occupies the full width on the left with `text-sm font-medium line-clamp-2 break-words`.
  - Beneath the product name, unit price and quantity are displayed as `[Quantity] x [Unit Price]`.
  - Item subtotal is aligned to the right in `font-semibold text-zinc-900`.
- **UX Goal**: Eliminate horizontal scrollbar on the item list.

### 2. Action Separation (`order-summary-sidebar.tsx`)
- The `OrderSummarySidebar` component is refactored to allow separating the **Price Summary Card** from the **Action Cards** (PayOS Payment Link, Cash Deposit, Pending Verification, Cancel Order, Request Cancellation).
- On mobile layouts, the **Action Cards** are rendered at the top of the main column, immediately below the progress stepper, ensuring users do not need to scroll to complete their payment or cancel the order.
- The **Price Summary Card** remains at the bottom of the page.
