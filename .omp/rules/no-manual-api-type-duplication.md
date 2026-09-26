---
name: no-manual-api-type-duplication
description: "Derive frontend API types strictly from @/types/api or api-schema.d.ts and use centralized formatters"
condition: "(?:export\\s+interface\\s+(?:DashboardMetrics|MonthlyRevenue|TopSellingProduct|CategoryDistribution|Admin[A-Z][a-zA-Z0-9]*)\\b|\\bnew\\s+Intl\\.NumberFormat\\s*\\()"
scope:
  [
    "tool:write(admin/src/features/**)",
    "tool:edit(admin/src/features/**)",
    "tool:write(storefront/src/features/**)",
    "tool:edit(storefront/src/features/**)",
  ]
---

# API Types SSOT & Formatters

1. **Wire Types SSOT**: Derive 100% of API entity types from `@/types/api` (e.g. `export type DashboardMetrics = AdminDashboardAnalytics["metrics"]`). Never declare manual duplicate interfaces for endpoint responses.
2. **Local Feature Types**: Reserve `features/<feature>/<name>-types.ts` exclusively for client-only UI state (forms, step wizards).
3. **Cached Formatters**: Import singleton formatters (`formatCurrency`, `formatPrice`, `formatNumber`) from `@/lib/utils`. Never instantiate `new Intl.NumberFormat(...)` in components or loops.
