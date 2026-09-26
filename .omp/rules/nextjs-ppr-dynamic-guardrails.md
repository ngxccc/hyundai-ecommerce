---
name: nextjs-ppr-dynamic-guardrails
description: "Enforce Next.js 16 Partial Prerendering connection boundaries and Server Component first architecture"
condition: "await connection\\(\\)"
scope:
  [
    "tool:write(admin/app/**)",
    "tool:edit(admin/app/**)",
    "tool:write(storefront/app/**)",
    "tool:edit(storefront/app/**)",
  ]
---

# Next.js 16 PPR & Server Component Standards

1. **PPR Dynamic Boundaries**: When `cacheComponents: true` is enabled, any Server Component calling authenticated APIs via `openapi-fetch` MUST call `await connection()` from `next/server` before the request.
2. **Server Components First**: Default to `async function` Server Components using `getTranslations` from `next-intl/server`. Only add `"use client"` when state or event listeners are required.
3. **Deterministic Prerender**: Use static dimensions or index-based values for skeletons. Avoid `Math.random()`.
4. **Dynamic Routes**: Omit `generateStaticParams` entirely on dynamic `[id]` / `[slug]` pages when fully dynamic rendering is intended.
