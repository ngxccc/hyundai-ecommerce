# Admin Dashboard Dynamic Data - Plan

**Date:** 05-06-26
**Complexity:** Simple
**Status:** ✅ COMPLETED

## Overview

Transition the Admin Dashboard page (`apps/admin/app/[locale]/(dashboard)/page.tsx`) and its client-side components (`metrics-cards.tsx`, `revenue-chart.tsx`, `top-products.tsx`, `recent-orders-table.tsx`) from using hardcoded mock data to fetching real, dynamic data from the PostgreSQL database using Drizzle ORM through the service layer.

---

## Quick Links

- [Admin Dashboard Dynamic Data - Plan](#admin-dashboard-dynamic-data---plan)
  - [Overview](#overview)
  - [Quick Links](#quick-links)
  - [Goals and Success Metrics](#goals-and-success-metrics)
  - [Execution Brief](#execution-brief)
    - [Phase 1: Service Layer Extensions](#phase-1-service-layer-extensions)
    - [Phase 2: Unit Testing](#phase-2-unit-testing)
    - [Phase 3: Server Component Integration](#phase-3-server-component-integration)
    - [Phase 4: Client Components Transition](#phase-4-client-components-transition)
  - [Scope](#scope)
  - [Touchpoints](#touchpoints)
  - [Public Contracts](#public-contracts)
    - [Service Interfaces (`packages/database/src/services/interfaces.ts`)](#service-interfaces-packagesdatabasesrcservicesinterfacests)
  - [Blast Radius](#blast-radius)
  - [Verification Evidence](#verification-evidence)
    - [Automated Tests](#automated-tests)
    - [Manual Validation](#manual-validation)
  - [Resume and Execution Handoff](#resume-and-execution-handoff)
  - [Implementation Checklist](#implementation-checklist)

---

## Goals and Success Metrics

**Goals:**

- Eliminate all hardcoded mock arrays (`MOCK_PRODUCTS`, `MOCK_ORDERS`, static metrics and chart data) in the dashboard features.
- Implement efficient database aggregate queries in the database service layer.
- Query these services in the Server Component `page.tsx` and feed them down to the client components as props.
- Add co-located unit tests to verify the new service methods.

**Success Metrics:**

- Total Revenue, Total Orders, Total Products, and New Customers cards show correct real-time data from the database.
- The monthly revenue chart correctly sums up `totalAmount` grouping by month for the selected year.
- Top Selling Products displays the top N products by total volume sold (`quantity`).
- Recent Orders displays the 5 most recent orders with correct mapped status badges and customer details.
- Unit tests for all new service methods pass.

---

## Execution Brief

This is a SIMPLE plan. We will implement these changes continuously, validating each part using tests and preview.

### Phase 1: Service Layer Extensions

Extend `OrderService`, `ProductService`, and `UserService` in `packages/database/src/services/` to query Drizzle for the required aggregate data and recent list. Declare these on their respective interfaces in `interfaces.ts`.

### Phase 2: Unit Testing

Add unit tests for the new database service methods inside `order.service.test.ts`, `product.service.test.ts`, and `user.service.test.ts`.

### Phase 3: Server Component Integration

Update `apps/admin/app/[locale]/(dashboard)/page.tsx` to be an async Server Component that imports `orderService`, `productService`, and `userService` from `@nhatnang/database/services`, calls the new query methods, and passes the result props down to components.

### Phase 4: Client Components Transition

Update `metrics-cards.tsx`, `revenue-chart.tsx`, `top-products.tsx`, and `recent-orders-table.tsx` to receive dynamic data through typed TypeScript props instead of reading mock arrays. Clean up the unused mock data declarations.

---

## Scope

**In-Scope:**

- Schema aggregate queries for dashboard components.
- Service methods for dashboard-wide analytics.
- Server-to-client props passing.
- Custom database unit tests.
- UI mapping and localization for order statuses.

**Out-of-Scope:**

- Real-time WebSockets notifications for dashboard metrics.
- Advanced pagination or sorting controls on the main dashboard page itself (which should remain a high-level summary overview).

---

## Touchpoints

Below are the exact files that will be created or modified:

| Path                                                                   | Action | Description                                                     |
| ---------------------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| `packages/database/src/services/interfaces.ts`                         | Modify | Add interface definitions for new dashboard analytics methods.  |
| `packages/database/src/services/order.service.ts`                      | Modify | Implement metrics, chart aggregator, and recent orders methods. |
| `packages/database/src/services/product.service.ts`                    | Modify | Implement top-selling products aggregate query.                 |
| `packages/database/src/services/user.service.ts`                       | Modify | Implement count for users created in last N days.               |
| `packages/database/src/services/order.service.test.ts`                 | Modify | Add unit tests for new `OrderService` dashboard methods.        |
| `packages/database/src/services/product.service.test.ts`               | Modify | Add unit tests for new `ProductService` top-selling method.     |
| `packages/database/src/services/user.service.test.ts`                  | Modify | Add unit tests for new `UserService` count method.              |
| `apps/admin/app/[locale]/(dashboard)/page.tsx`                         | Modify | Fetch data from services and pass as typed props to components. |
| `apps/admin/src/features/dashboard/components/metrics-cards.tsx`       | Modify | Remove mock metrics; accept metrics prop.                       |
| `apps/admin/src/features/dashboard/components/revenue-chart.tsx`       | Modify | Remove mock monthly bar heights; accept revenue data prop.      |
| `apps/admin/src/features/dashboard/components/top-products.tsx`        | Modify | Remove `MOCK_PRODUCTS`; accept top-selling products prop.       |
| `apps/admin/src/features/dashboard/components/recent-orders-table.tsx` | Modify | Remove `MOCK_ORDERS`; accept recent orders prop.                |

---

## Public Contracts

### Service Interfaces (`packages/database/src/services/interfaces.ts`)

```typescript
export interface IDashboardMetrics {
  totalRevenue: string; // Total SUM(totalAmount) for successful orders
  totalOrders: number; // Total COUNT(orders)
  totalProducts: number; // Total COUNT(products)
  newCustomers: number; // Users registered in the last 30 days
  revenueGrowth: number; // % change in revenue compared to previous 30 days
  ordersGrowth: number; // % change in orders compared to previous 30 days
  customersGrowth: number; // % change in new customers count compared to previous period
}

export interface IMonthlyRevenue {
  month: string; // e.g. "01", "02"
  revenue: string; // SUM(totalAmount) for that month
  orderCount: number;
}

export interface ITopSellingProduct {
  id: string;
  name: string;
  sold: number; // SUM(order_items.quantity)
  price: string;
  image: string | null;
}

// Declarations to add to interfaces
export interface IOrderService {
  // ... existing methods
  getDashboardMetrics(): Promise<IDashboardMetrics>;
  getMonthlyRevenue(year: number): Promise<IMonthlyRevenue[]>;
}

export interface IProductService {
  // ... existing methods
  getTopSellingProducts(limit: number): Promise<ITopSellingProduct[]>;
}

export interface IUserService {
  // ... existing methods
  getNewUsersCount(days: number): Promise<number>;
}
```

---

## Blast Radius

- **Service Registry**: This change only adds new methods to existing services; it does not change existing behavior or callsites in other sections of the CRM or Storefront.
- **Drizzle Queries**: Aggregate SQL queries use `date_trunc`, `sum`, and `count`. Ensure database index on `orders(createdAt)` and `users(createdAt)` are utilized to keep queries fast.
- **Client Bundles**: No additional external libraries are added, keeping the bundle size constant.

---

## Verification Evidence

### Automated Tests

Run unit tests for service extensions using Bun Test:

```bash
bun test packages/database/src/services/order.service.test.ts
bun test packages/database/src/services/product.service.test.ts
bun test packages/database/src/services/user.service.test.ts
```

### Manual Validation

1. Start the Doppler-backed development server:
   ```bash
   bun dev
   ```
2. Navigate to `/vi` or `/en` (Admin Dashboard path) on `localhost:3000`.
3. Verify metrics correspond directly to database contents.
4. Verify console output is clean of React hydration mismatches or server/client component boundary issues.

---

## Resume and Execution Handoff

- **Execute Anchor**: `process/general-plans/active/dashboard-dynamic-data_PLAN_05-06-26.md`
- **Next Valid Mode**: `ENTER EXECUTE MODE` (after plan approval)
- **Harness Skills for Implementation**:
  - `nextjs`: Reference for Next.js 16 Server Component async fetching and App Router caching patterns.
  - `typescript-refactor`: Guidelines on modern TypeScript, type-narrowing, and correct interface declarations.
  - `tailwind`: Reference for Tailwind CSS styling and theme matching in components.
  - `ag:predict`: Can be used to debate edge cases (like how growth percentage handles divide-by-zero when the previous period had 0 orders).
  - `ag:scenario`: Excellent for enumerating edge cases on database connectivity or empty databases.

---

## Implementation Checklist

1. **Extend `packages/database/src/services/interfaces.ts`**
   - Declare the new method signatures and types (`IDashboardMetrics`, `IMonthlyRevenue`, `ITopSellingProduct`).
2. **Implement methods in `order.service.ts`**
   - Implement `getDashboardMetrics()`. Handle growth comparisons (with divide-by-zero checks).
   - Implement `getMonthlyRevenue(year)`.
3. **Implement method in `product.service.ts`**
   - Implement `getTopSellingProducts(limit)`. Join `order_items` and `products`.
4. **Implement method in `user.service.ts`**
   - Implement `getNewUsersCount(days)`.
5. **Add tests in `*.service.test.ts`**
   - Write unit tests for new methods using mocked database transaction.
6. **Fetch and pass data in `apps/admin/app/[locale]/(dashboard)/page.tsx`**
   - Fetch data using service singletons. Pass values as props to components.
7. **Refactor Client Components in `apps/admin/src/features/dashboard/components/`**
   - Update `metrics-cards.tsx` to receive and display dynamic metrics.
   - Update `revenue-chart.tsx` to accept monthly revenue chart data.
   - Update `top-products.tsx` to render top products from props.
   - Update `recent-orders-table.tsx` to render recent orders from props; map DB statuses to Vietnamese/English translation keys properly.
8. **Run test suite and verify UI locally**
   - Build, check types, run tests, and check in browser.
