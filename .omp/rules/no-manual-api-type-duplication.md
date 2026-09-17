---
name: no-manual-api-type-duplication
description: "Never redeclare manual TypeScript interfaces for API models; derive types strictly from `@/types/api` or `api-schema.d.ts`"
condition: "(?:export\\s+interface\\s+(?:DashboardMetrics|MonthlyRevenue|TopSellingProduct|CategoryDistribution|Admin[A-Z][a-zA-Z0-9]*)\\b|\\bnew\\s+Intl\\.NumberFormat\\s*\\()"
scope:
  [
    "tool:write(admin/src/features/**/*.ts)",
    "tool:write(admin/src/features/**/*.tsx)",
    "tool:edit(admin/src/features/**/*.ts)",
    "tool:edit(admin/src/features/**/*.tsx)",
    "tool:write(storefront/src/features/**/*.ts)",
    "tool:write(storefront/src/features/**/*.tsx)",
    "tool:edit(storefront/src/features/**/*.ts)",
    "tool:edit(storefront/src/features/**/*.tsx)",
  ]
---

# Two-Tier Type System & Formatters SSOT Rule

1. **Zero Manual Type Duplication for API Entities**: Never declare manual TypeScript `interface` or `type` definitions for data returned by or sent to backend endpoints. Derive 100% of wire types strictly from `@/types/api` (e.g., `export type DashboardMetrics = AdminDashboardAnalytics["metrics"];`).
2. **Feature Types Boundary**: Dedicated `features/<feature>/<name>-types.ts` files are strictly reserved for client-side local UI state (form schemas, wizard steps, canvas state) that do not exist on the backend. Never create shallow `types.ts` files that merely re-export or mimic API DTOs.
3. **Centralized Singleton Formatters**: Never instantiate `new Intl.NumberFormat(...)` inside UI components or render loops. Import cached singleton formatters (`formatCurrency`, `formatPrice`, `formatNumber`, `formatVNDShort`) from `@/lib/utils`.
