# Design Doc: Logout Cache Fix

* **Date:** 2026-06-18
* **Topic:** Logout Cache Fix

## Problem
In Next.js App Router, visiting `/portal/profile` after logout and login displays the stale session details of the old user due to client-side Router Cache.

## Approved Approach
Apply a hard reload (`window.location.href`) during logout for both storefront and admin applications to fully clear client-side caches (Next.js Router Cache, React states, Zustand stores).

## Component Changes
1. **Storefront Nav Links (`apps/storefront/src/features/portal/components/nav-links.tsx`)**:
   Use `useLocale()` and set `window.location.href = loginPath` inside `handleLogout`.
2. **Storefront Mobile Menu (`apps/storefront/src/features/home/components/mobile-menu.tsx`)**:
   Use `useLocale()` and set `window.location.href = homePath` inside `handleLogout`.
3. **Admin Sidebar (`apps/admin/src/features/dashboard/components/admin-sidebar.tsx`)**:
   Set `window.location.href = loginPath` inside `handleLogout`.
