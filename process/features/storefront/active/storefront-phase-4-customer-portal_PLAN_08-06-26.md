# Phase 4: Customer Quoting & Negotiation Portal — Plan

**Date**: 08-06-26  
**Complexity**: Simple  
**Status**: ⏳ PLANNED

## Overview

Implement a customer dashboard on the Storefront that allows customers to submit quote requests (Request Quote flow), view active quote lists, review B2B price counter-offers from the admin, and exchange timeline messages with sales representatives.

This phase conforms to the B2B CRM standards set in `process/context/all-context.md`.

---

## Phase Completion Rules

* Complete when the storefront quoting drawer and user quotes pages compile and allow bid/pricing timeline updates.
* Integration tests between the admin CRM cockpit and storefront user quotes flow pass.

---

## Acceptance Criteria

- Customer can submit quote requests from product detail views.
- `/quotes` page renders user-specific quotes from the database.
- Timeline panel displays chat messages and price negotiation states.

---

## Implementation Checklist

- [ ] Build product detail Request Quote button/drawer.
- [ ] Build `/quotes` list and details views.
- [ ] Build client server actions for counter-offer accept/reject.

---

## Touchpoints

- `apps/storefront/app/[locale]/quotes/page.tsx`
- `apps/storefront/app/[locale]/quotes/[id]/page.tsx`

---

## Public Contracts

- `/quotes` and `/quotes/[id]` router endpoints.
- Server Action functions for client-side quote interactions.

---

## Blast Radius

- Moderate. Touches storefront auth views and quotes data tables.
- No modifications to schema definitions.

---

## Verification Evidence

- Run type checking: `tsc --noEmit`.
- Run validation suite as defined in `process/context/tests/all-tests.md`.
- Manually check data flow from storefront quote submission to admin cockpit.

---

## Resume and Execution Handoff

* Fetch data using existing `QuotesService` capabilities.
* Align timeline message structures with B2B CRM schemas.
* Verify security context of quotes reads (user scope only).

Next Step: ENTER EXECUTE MODE on storefront-phase-4-customer-portal_PLAN_08-06-26.md.
