# 7. Zero-Overhead Typed HTTP Transport Architecture via openapi-fetch in Decoupled Multi-App Setup

Date: 2026-09-12

## Status

Accepted

## Context

The system architecture is structured as a decoupled, polyrepo-ready platform comprising three independent applications:

1. `backend/`: Standalone NestJS 11 REST API Server (Port 3000).
2. `admin/`: Standalone Next.js 16 Backoffice Admin CMS (Port 3002).
3. `storefront/`: Standalone Next.js 16 Customer Quotation & Catalog Portal (Port 3001).

Connecting these frontend applications to the backend API required an architectural decision on the HTTP transport and contract synchronization mechanism.

### Evaluated Alternatives

1. **Heavyweight SDK Generators (OpenAPI Generator / Orval / Axios Wrappers)**:
   - _Drawback_: Emits thousands of lines of runtime JavaScript classes, duplicate method signatures, and custom Axios client wrappers.
   - _Next.js Conflict_: Fails to integrate cleanly with Next.js 16 React Server Components (RSC) and native `fetch` caching semantics (`"use cache"`, tag revalidation). Adds unnecessary bundle weight to client components.
2. **tRPC / Monolithic Sharing**:
   - _Drawback_: Imposes tight coupling between backend TypeScript AST and frontend runtimes, forcing a unified monorepo and preventing independent polyrepo deployment or consumption by external third-party B2B partners.
3. **Manual Interface Duplication**:
   - _Drawback_: Developers manually write TypeScript interfaces in frontend repos. Inevitably leads to severe contract drift, silent runtime bugs (`undefined` properties), and broken production releases.

---

## Decision

We adopt **`openapi-fetch`** paired with **`openapi-typescript`** as the standardized HTTP transport and contract layer across all frontend applications:

### 1. Type-Only Contract Extraction (Zero Runtime Bloat)

- The backend serves as the single source of truth for the API contract via `backend/openapi.json` (generated from Zod DTOs, as established in ADR-0003).
- Frontend applications run `openapi-typescript` to extract a pure TypeScript type definition file:
  ```bash
  # admin/package.json & storefront/package.json
  "types:pull": "bunx openapi-typescript ../backend/openapi.json -o src/types/api-schema.d.ts"
  ```
- The output `api-schema.d.ts` contains **zero runtime JavaScript bytes**; it is entirely eliminated during the TypeScript compilation phase.

### 2. Microscopic Native Fetch Wrapper (`openapi-fetch`)

- Client instances are instantiated using `createClient<paths>` from `openapi-fetch`:
  ```typescript
  import createClient from "openapi-fetch";
  import type { paths } from "@/types/api-schema";

  export const api = createClient<paths>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  });
  ```
- **Runtime Footprint**: `openapi-fetch` is a lightweight (<1KB) wrapper around global `fetch`. It passes native `RequestInit` options directly to Node.js/browser fetch, preserving 100% compatibility with Next.js 16 caching, ISR, and streaming architectures.

### 3. Sub-Second Full-Stack Synchronization

- A single workspace coordination script keeps all applications in compile-time alignment:
  ```bash
  bun run types:sync
  ```
- If a backend developer renames a DTO property (e.g., `price` to `unitPrice`), running `bun run check-types` across the workspace immediately flags every affected frontend callsite at compile-time before code can be committed.

### 4. Transparent Client-Side Token Rotation

- In the Admin backoffice (`admin/src/lib/api-client.ts`), a custom middleware layer intercepts outgoing requests.
- It inspects the JWT expiration timestamp inside the `adminAccessToken` HttpOnly cookie:
  - If the access token has less than 60 seconds of validity remaining, the middleware transparently triggers a silent refresh call (`POST /api/v1/auth/refresh`) using raw `fetch`.
  - The refreshed access token is injected into the pending request's `Authorization: Bearer <token>` header without blocking the user interface or failing the user's action.

---

## Consequences & Trade-offs

### Positive

- **Zero Runtime Overhead**: No generated SDK classes, no Axios bloat, 0KB added to client JavaScript bundles.
- **End-to-End Type Safety**: 100% compile-time autocomplete and type verification for route paths, request query parameters, request bodies, and response payloads.
- **Polyrepo Independence**: Frontend applications depend only on the static `openapi.json` contract, allowing independent deployment, versioning, and CI pipelines.
- **Native Next.js 16 Harmony**: Operates seamlessly within React Server Components, Server Actions, and Client Components.

### Negative & Mitigations

- **Explicit Synchronization Step**: Developers must execute `bun run types:sync` when backend contracts evolve.
  - _Mitigation_: Monorepo root CI workflows enforce `bun run types:sync` and assert a clean git working tree before passing pull requests.
