# Storefront Error Boundaries Implementation Plan

**Date**: June 12, 2026
**Complexity**: SIMPLE
**Implementation Approach**: Localized Error Boundary (`error.tsx`) + Root Global Error Boundary (`global-error.tsx`)
**Execution Model**: Single phase with visual validation and build checks
**Status**: ⏳ PLANNED

---

## Overview

This implementation plan outlines the integration of Next.js 16 file-system error boundaries (`error.tsx` and `global-error.tsx`) inside the `storefront` application. These boundaries will catch unhandled runtime rendering exceptions (such as database query failures, Drizzle parsing issues, or missing translation keys) and display a localized, user-friendly error fallback screen with a "Try again" button, rather than crashing the whole page layout or showing a default 500 error screen.

This plan is based on the repository context defined in `process/context/all-context.md`.

---

## Touchpoints

- **Storefront App (`apps/storefront`)**:
  - `apps/storefront/app/[locale]/error.tsx` (new localized error boundary for segments)
  - `apps/storefront/app/global-error.tsx` (new global fallback for root layout failures)
  - `apps/storefront/messages/en.json` (translation messages under `ErrorPage`)
  - `apps/storefront/messages/vi.json` (translation messages under `ErrorPage`)

---

## Public Contracts

### Localized Segment Error Boundary

The segment error boundary file `app/[locale]/error.tsx` must be a Client Component and export a default React component matching this signature:

```typescript
"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) { ... }
```

### Global Root Error Boundary

The global error boundary file `app/global-error.tsx` catches errors thrown in the root layout (where `[locale]/layout.tsx` has not mounted). It must be a Client Component, export a default React component, and render its own `<html>` and `<body>` tags:

```typescript
"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) { ... }
```

---

## Blast Radius

- **Root Layout Bypass**:
  - When `global-error.tsx` is triggered, the root `layout.tsx` is bypassed, meaning our standard Header, navigation context, and Footer are not rendered. The global error page must render a standalone fallback shell that includes basic brand typography to remain presentable.
- **Translation Context inside `error.tsx`**:
  - `error.tsx` is inside the `[locale]` dynamic segment, meaning it has access to next-intl translation hooks.
  - `global-error.tsx` runs outside the `[locale]` dynamic segment, meaning it does **not** have access to next-intl active locale context out of the box. We must implement a default fallback language (e.g. English/Vietnamese hardcoded side-by-side or parsed from pathname) inside the global error component.

---

## Phase Completion Rules

Every phase defined in this plan must be verified and checked in full before advancing:
1. **Types Safety**: Running `bun turbo run check-types` must succeed with zero TypeScript compiler errors.
2. **Lint Verification**: Running `bun run lint` must pass with zero warnings.
3. **Execution Integrity**: Throwing an error manually inside a page must activate the correct error boundary.
4. **Post-Phase Testing**: Verify that client-side hydration completes with zero browser console errors after error recovery and retry.

---

## Acceptance Criteria

- **AC 1: Localized Error Boundary**: Creating a runtime error in `/products` displays the localized `<ErrorBoundary />` component, which preserves the parent Header/Footer and offers a working "Thử lại / Try Again" button that triggers `reset()`.
- **AC 2: Global Error Boundary**: Creating a runtime error inside the root layout displays the standalone `<GlobalError />` page, rendering its own `<html>` and `<body>` shell with a clear error message.
- **AC 3: Translation Keys**: Next-intl files contain the keys `ErrorPage.title`, `ErrorPage.description`, and `ErrorPage.retryButton` in English and Vietnamese.
- **AC 4: Compile Pass**: The storefront application compiles and builds successfully under Turbopack.

---

## Implementation Checklist

### Phase 1: Localized & Global Error Boundaries Setup
- [ ] Add `ErrorPage` translation keys to `apps/storefront/messages/en.json` and `vi.json`.
- [ ] Create `apps/storefront/app/[locale]/error.tsx` as a client component:
  - Import translation hooks using next-intl.
  - Render a styled Card with an alert icon, error message, and a Button that calls `reset()`.
  - Ensure it runs inside the localized Layout shell.
- [ ] Create `apps/storefront/app/global-error.tsx` as a client component:
  - Render root `<html>` and `<body>` tags.
  - Render a clean error message and a retry button.
  - Hardcode dual-locale instructions (e.g., "Something went wrong / Đã xảy ra lỗi") since next-intl context is unavailable at root level.
- [ ] Verify compilation and linting:
  ```bash
  bun turbo run check-types --filter=storefront && bun run lint --filter=storefront
  ```
- [ ] Build the storefront:
  ```bash
  bun turbo run build --filter=storefront
  ```

---

## Verification Evidence

### 1. Typecheck & Lint Check
Verify static compilation:
```bash
bun turbo run check-types --filter=storefront && bun run lint --filter=storefront
```
Expected: Pass with 0 errors.

### 2. Manual Visual QA Test
Temporarily inject `throw new Error("Test Query Failure")` inside `apps/storefront/app/[locale]/page.tsx` and verify that the page renders the localized error card within the Layout (Header and Footer stay intact).

---

## Resume and Execution Handoff

1. Locate this plan at `process/general-plans/active/storefront-error-boundaries_PLAN_12-06-26.md`.
2. First, create the translations under `ErrorPage` namespace.
3. Keep the styling clean and consistent with `@nhatnang/ui` components (like Card, Button).

**Next Step**: Review this plan, approve for execution, then enter EXECUTE mode.
