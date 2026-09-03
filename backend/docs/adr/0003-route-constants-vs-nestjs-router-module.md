# 3. Route Constants vs NestJS Router Module

Date: 2026-07-15  
Deciders: Team / Core Architecture

### Metadata

- **ID**: `ADR-0003`
- **Status**: `Accepted`
- **Date**: `2026-07-15`
- **Feature**: `auth`
- **Topic**: `Route Constants vs NestJS Router Module Selection`
- **Target Module**: `src/modules/auth/` & `src/common/constants/`
- **Spec Reference**: `docs/design/user-registration-workflow.md`

---

## Status

Accepted

---

## Context

The system must generate full action URLs (e.g., email verification, password reset links) sent to users. These path templates are defined at the HTTP layer (Controllers) but must be consumed and generated inside background workers (BullMQ).

We evaluated two route management strategies:

1. **Option A (Route Constants)**: Declare route paths as static TypeScript constants (`as const`) imported by Controllers and Mail Services alike.
2. **Option B (NestJS RouterModule)**: Define dynamic route prefixes via NestJS Module decorators.

---

## Considered Options

- **Option A (Chosen)**: Static Route Constants (`as const`) — _Chosen for context decoupling in BullMQ workers and compile-time type safety_
- **Option B**: Dynamic NestJS RouterModule — _Rejected because dynamic NestJS app tree reflection causes circular dependency risks and runtime typos_

---

## Decision

**Y-Statement Summary**: In the context of background worker URL generation, facing HTTP framework coupling and runtime typos, we decided for static typed route constants (`as const`) to achieve compile-time type safety and context decoupling, accepting minor boilerplate of creating constant files.

We chose **Option A: Feature-level Static Route Constants** with the `as const` modifier to lock literal types.

```typescript
// src/modules/auth/auth.routes.ts
export const AUTH_ROUTES = {
  BASE: "auth",
  VERIFY_EMAIL: "verify-email",
} as const;
```

---

## Evaluated Architectural Options & Comparison

### Option A: Static Route Constants (`as const`) (CHOSEN)

- **Characteristics**: Defines route path constants directly in module files (e.g., `src/modules/auth/auth.routes.ts`) using `as const`. Directly imported by HTTP Controllers and background mail workers.
- **Pros**:
  - Context Decoupling: Background workers (BullMQ) operating outside the HTTP request lifecycle generate URLs instantly without querying NestJS HTTP Application trees.
  - Compile-time Validation: TypeScript (`bun run check-types`) catches path typos immediately at build time.
  - Reusable across frontend API SDKs (React/Next.js).
- **Cons**: Requires creating a constant file for new modules.

### Option B: Dynamic NestJS RouterModule (REJECTED)

- **Characteristics**: Configures hierarchical route prefixes inside NestJS `@Module()` decorators.
- **Pros**: Centralized route prefix management within the NestJS framework.
- **Cons**:
  - Risks circular dependencies or requires heavy reflection querying the NestJS App tree from background workers.
  - Runtime errors: Typos in route string literals pass compilation, failing only when users hit 404 on Production.
  - Cannot export route configurations to frontend applications.

---

## Decision Comparison Matrix

| Evaluation Criteria                    | Option A: Static Route Constants (`as const`) (CHOSEN) | Option B: NestJS RouterModule               |
| :------------------------------------- | :----------------------------------------------------- | :------------------------------------------ |
| **Context Decoupling (BullMQ Worker)** | ⚡⚡⚡ Full (Zero HTTP engine dependency)              | 🔴 Complex (Requires reflection/tree query) |
| **Compile-time Type Safety**           | 🔒 100% (Build fails on typo)                          | ⚠️ Runtime only (Fails with 404 in prod)    |
| **Frontend Code Sharing**              | 🟢 Easy export (Pure TS object)                        | 🔴 Cannot export outside NestJS Decorators  |
| **Maintenance Overhead**               | 🟡 Extra constant file per module                      | 🟢 Dynamic module configuration             |

---

## Consequences

### Positive Outcomes

1. **Compile-time Type Safety**: Eliminates magic string route typos prior to deployment.
2. **Context Independence for Workers**: Enables BullMQ workers to build action URLs without instantiating HTTP containers.
3. **Frontend SDK Export**: Route constant objects can be shared directly with Next.js API client SDKs.

### Explicit Tradeoffs

- **Static File Overhead**: Developers add a route constant file when introducing new modules.

---

## Status & Approval

- **Status**: Accepted & Implemented.
- **Target Location**: `docs/adr/0003-route-constants-vs-nestjs-router-module.md`
