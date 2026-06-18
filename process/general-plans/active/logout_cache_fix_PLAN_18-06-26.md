# Logout Cache Fix - Plan

**Date:** 18-06-26  
**Complexity:** Simple  
**Status:** ⏳ PLANNED

## Overview

Fix Next.js Client-side Router Cache issue when logging out by implementing a hard reload redirect using `window.location.href`. This ensures that all React states, Zustand stores, and Next.js page caches are completely wiped, preventing session bleeding when a new user logs in.

## Quick Links

- [Goals and Success Metrics](#goals-and-success-metrics)
- [Execution Brief](#execution-brief)
- [Scope](#scope)
- [Assumptions and Constraints](#assumptions-and-constraints)
- [Acceptance Criteria](#acceptance-criteria)
- [Implementation Checklist](#implementation-checklist)
- [Touchpoints](#touchpoints)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

## Goals and Success Metrics

**Goals:**
* Prevent the storefront portal from displaying stale session information of the previously logged-out user.
* Prevent the admin panel from holding stale UI/state from the previous session after logout.

**Success Metrics:**
* Logging out of the Storefront portal triggers a hard reload and redirects to the localized login page `/login` or `/[locale]/login`.
* Logging out of the Storefront mobile menu triggers a hard reload and redirects to the localized home page `/` or `/[locale]`.
* Logging out of the Admin panel triggers a hard reload and redirects to the localized login page.

---

## Execution Brief

This is a SIMPLE plan. The implementation will proceed sequentially across Storefront and Admin codebases, followed by local verification.

### Phase 1: Storefront Implementation
* Update `nav-links.tsx` and `mobile-menu.tsx` to handle localized redirect paths and perform hard reloads on logout.

### Phase 2: Admin Implementation
* Update `admin-sidebar.tsx` to perform a hard reload on logout.

### Phase 3: Verification
* Run checks to verify TypeScript types, linting, and build validation.

---

## Scope

**In-Scope:**
* Modifying client-side logout click handlers to perform `window.location.href` navigation.
* Using `useLocale()` from `next-intl` to construct correctly localized URL prefixes.

**Out-of-Scope:**
* Changing authentication flow, session TTL, database schemas, or API endpoint routes.
* Redesigning login/registration layouts.

## Assumptions and Constraints

**Assumptions:**
* The default locale is `vi`, and `localePrefix` is configured as `"as-needed"`, meaning locale prefixes are omitted for `vi` and present for `en`.
* Modifying these three components covers all user-facing logout triggers in both applications.

**Constraints:**
* Must maintain the active user language selection during the logout redirect.

## Design Specification

Please see the design document at `process/general-plans/references/2026-06-18-logout-cache-fix-design.md` for full design and details.

## Acceptance Criteria

1. ✅ Storefront Portal Sidebar Logout redirects to `/login` (for locale `vi`) or `/en/login` (for locale `en`) using `window.location.href`.
2. ✅ Storefront Mobile Menu Logout redirects to `/` (for locale `vi`) or `/en` (for locale `en`) using `window.location.href`.
3. ✅ Admin Sidebar Logout redirects to `/login` (for locale `vi`) or `/en/login` (for locale `en`) using `window.location.href`.
4. ✅ No TS errors or build failures.

## Implementation Checklist

1. **Update Storefront Portal Navigation**
   - File: `apps/storefront/src/features/portal/components/nav-links.tsx`
   - Import `useLocale` from `next-intl`.
   - Update `handleLogout` to obtain the locale and redirect via `window.location.href`.

2. **Update Storefront Mobile Menu**
   - File: `apps/storefront/src/features/home/components/mobile-menu.tsx`
   - Import `useLocale` from `next-intl`.
   - Update `handleLogout` to obtain the locale and redirect via `window.location.href`.

3. **Update Admin Sidebar**
   - File: `apps/admin/src/features/dashboard/components/admin-sidebar.tsx`
   - Update `handleLogout` to redirect via `window.location.href`.

4. **Run Verification Commands**
   - Run type checks: `bun check-types`
   - Run linting: `bun lint`
   - Run build to verify packaging: `bun build`

## Touchpoints

* `apps/storefront/src/features/portal/components/nav-links.tsx`
* `apps/storefront/src/features/home/components/mobile-menu.tsx`
* `apps/admin/src/features/dashboard/components/admin-sidebar.tsx`

## Public Contracts

No public contracts or API schemas are modified.

## Blast Radius

Minimal. Only affects the redirect behavior immediately after clicking "Logout".

## Verification Evidence

Evidence of successful runs of:
- `bun check-types`
- `bun lint`

## Cursor + RIPER-5 Guidance

**Next Step:** Transition to **EXECUTE MODE** to apply the checklist changes.
