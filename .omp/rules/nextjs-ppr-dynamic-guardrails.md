---
name: nextjs-ppr-dynamic-guardrails
description: "Enforce Next.js 16 Dynamic IO PPR connection boundaries and Server Component first architecture"
condition: "await connection\\(\\)"
scope: ["tool:edit(*.tsx)", "tool:write(*.tsx)"]
---

# Next.js 16 PPR & Server Component Guardrails

- **Dynamic Request Boundaries**: When `cacheComponents: true` (PPR) is enabled, any dynamic Server Component accessing authenticated backend APIs via `openapi-fetch` (with JWT cookies) MUST call `await connection()` from `next/server` before the API call to switch from static prerender to per-request dynamic streaming.
- **Server Component First**: Static presentation components (e.g., Headers, KPI Metric Cards) MUST be React Server Components (`async function`) using `getTranslations` from `next-intl/server`. Only add `"use client"` when `useState`, `useEffect`, or event handlers are strictly required.
- **Deterministic Prerender**: Never use `Math.random()` in server components or skeleton placeholders — use fixed deterministic dimensions or index-based values.
- **No Empty `generateStaticParams`**: Never export `generateStaticParams = () => []` on dynamic `[id]` routes; dynamic routes should omit `generateStaticParams` entirely.
