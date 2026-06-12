# Phase 1: Storefront API Mock Migration — Plan

**Date**: 08-06-26  
**Complexity**: Simple  
**Status**: ✅ VERIFIED

## Overview

Replace the static mock responses inside the Storefront API routes with live queries calling `ProductService` and `CategoryService` from `@nhatnang/database`.

This phase conforms to the coding and indexing guidelines in `process/context/all-context.md`.

---

## Phase Completion Rules

- Complete when all product and category API routes fetch directly from the database services.
- Type checks and tests pass with 100% success rate.

---

## Acceptance Criteria

- `/api/products` returns real database products instead of static mock data.
- `/api/categories` returns real database categories instead of static mock data.
- API responses structure remains compatible with the B2B storefront features.

---

## Implementation Checklist

- [x] Import `ProductService` and replace static mock array in `/api/products`.
- [x] Import `CategoryService` and replace static mock array in `/api/categories`.
- [x] Verify query filtering support for category classification.

---

## Touchpoints

- `apps/storefront/app/api/products/route.ts`
- `apps/storefront/app/api/categories/route.ts`

---

## Public Contracts

- `/api/products` response payload format.
- `/api/categories` response payload format.

---

## Blast Radius

- Minimal. Changes are limited to storefront API endpoints.
- No impact on the admin application.

---

## Verification Evidence

- Run tests in `apps/storefront` and database package as defined in `process/context/tests/all-tests.md`.
- Verify query compile safety using `tsc --noEmit`.
- Verify response structures manually using HTTP fetch calls.

---

## Resume and Execution Handoff

- Identify current mock endpoints under `apps/storefront/app/api/`.
- Swap the mock imports for database service functions.
- Verify tests pass.

Next Step: None. Implementation and verification completed.
