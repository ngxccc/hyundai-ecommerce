# 3. Next.js Route Groups for Protected Layouts

Date: 2026-05-26

## Status

Accepted

## Context

In our Admin App (`apps/admin`), we need to check the user's authentication session to determine whether to render the `AdminSidebar` and allow access to the dashboard.

Initially, this session check (`getCachedSession()`) was placed directly in the `RootLayout` (`app/[locale]/layout.tsx`). Because `getCachedSession()` uses Next.js `headers()`, it opted the entire `RootLayout` into dynamic rendering. As a result, every single page within the application (including `/login`, `/forbidden`, and global catch-all routes) inherited this layout and was forced into dynamic rendering (`DYNAMIC_SERVER_USAGE`).

This caused several issues:

1. **Loss of Static Optimization**: Public-facing pages like `/login` or `/forbidden` could not be pre-rendered as Static HTML (SSG), impacting load performance.
2. **Vercel Deployment Crashes**: In serverless/edge environments like Vercel, if Next.js attempts to statically generate a page but encounters `headers()` at runtime without an explicit `force-dynamic` directive, it throws a 500 Runtime Error (`DYNAMIC_SERVER_USAGE`), leading to crashes (e.g., when accessing unhandled routes like `/customers`).

## Decision

We decided to use **Next.js Route Groups** to separate static public pages from dynamic protected pages, keeping the `RootLayout` strictly static.

1. **Clean RootLayout**: The `app/[locale]/layout.tsx` is now strictly limited to rendering the HTML shell (`<html>`, `<body>`) and base context providers (e.g., `NextIntlClientProvider`). It contains no authentication logic and no dynamic Next.js functions, allowing routes outside of the protected group to be statically generated.
2. **`(dashboard)` Route Group**: All protected dashboard pages (e.g., `/`, `/products`, `/[...rest]`) are moved into a new `(dashboard)` Route Group.
3. **Protected Sub-layout**: We introduced `app/[locale]/(dashboard)/layout.tsx`. This layout handles the `getCachedSession()` call, renders the `AdminSidebar`, and explicitly declares `export const dynamic = "force-dynamic";`.
4. **Static Public Pages**: Pages like `/login` and `/forbidden` remain directly under `app/[locale]/`, isolating them from the dynamic sub-layout.

## Consequences

- **Positive (Performance)**: Public routes (`/login`, `/forbidden`) are now successfully compiled as Static HTML (`● SSG`), reducing Time-to-First-Byte (TTFB).
- **Positive (Stability)**: Vercel deployments will no longer crash due to unexpected `DYNAMIC_SERVER_USAGE` errors on static routes, because dynamic routes are explicitly marked with `force-dynamic`.
- **Positive (Separation of Concerns)**: UI scaffolding (HTML/Body/Providers) is strictly decoupled from Business UI (Admin Sidebar / Auth state).
- **Negative (File Structure Complexity)**: The file tree is slightly deeper, and URL paths do not perfectly map 1:1 to directory structures due to the invisible `(dashboard)` segment.
