# 10. Storefront Caching and Shared Services Architecture with Next.js 16

Date: 2026-06-12

## Status

Accepted

## Context

In a Turborepo monorepo architecture, `@nhatnang/database` provides raw database services (CRUD operations, schema definitions, and raw Drizzle queries) shared across multiple apps (such as `apps/storefront` and `apps/admin`).

However, implementing caching and data-fetching in `apps/storefront` using the Next.js 16 **Cache Components** model presents several architectural challenges and constraints:

1. **Direct Database Queries Bypass Caching**:
   - Importing raw database services directly from `@nhatnang/database` in Storefront pages or API routes causes every request to hit the PostgreSQL database. This increases connection pool pressure and risks overloading the database during high-traffic events (e.g., Black Friday).
2. **Next.js 16 Caching Serialization Constraints**:
   - The `"use cache"` directive requires all arguments passed to a cached function to be **fully serializable** (e.g., strings, numbers, booleans, or plain objects) so Next.js can generate a stable Cache Key.
   - If `"use cache"` is applied directly to an API Route Handler (e.g., `export async function GET(request: NextRequest)`), Next.js throws a compilation error because `NextRequest` contains non-serializable properties (sockets, streams, headers, etc.).
3. **Data Inconsistency and Cache Duplication**:
   - Storefront data (like products, categories, news) is fetched by both **Server Components** (for initial page render/SEO) and **API Routes** (for client-side interactions like "Load More", "Infinite Scroll", or dynamic filtering).
   - If caching helpers are declared locally inside API routes or page components, the application creates duplicate, disjointed cache spaces in memory. This leads to data inconsistency where the Server-rendered HTML and the API JSON response present different states (e.g., mismatched prices or product availability) and wastes server memory.
4. **Build-Time SSG Failures**:
   - Executing live database connections during Static Site Generation (SSG) / Metadata generation triggers SCRAM-SHA-256 PostgreSQL authentication. This invokes synchronous randomness (`crypto.randomBytes`), which is strictly forbidden during Next.js static rendering, causing build failures.

## Decision

We will establish a centralized **Storefront Shared Services Layer** in `apps/storefront/src/shared/services`.

1. **Storefront-Specific Service Wrapper**:
   - Create a service layer in `apps/storefront/src/shared/services` that wraps the raw database services.
   - This layer is the sole authority for Storefront data caching, localization mapping, and public data filtering (e.g., only querying `active = true` and `status = 'published'` products).
2. **Strict Use of `"use cache"` with Primitives**:
   - Apply the `"use cache"` directive to service functions.
   - Design service signatures to accept only serializable inputs (such as product slugs, pagination numbers, or search queries) instead of request objects.
   - Configure cache lifetimes (`cacheLife`) and revalidation tags (`cacheTag`) inside these services:

     ```typescript
     export async function getCachedCategoryBySlug(slug: string) {
       "use cache";
       cacheLife("hours");
       cacheTag(`category-${slug}`);
       return await dbService.getCategoryBySlug(slug);
     }
     ```

3. **Unified Consumer Access**:
   - Both **React Server Components (RSCs)** (Pages, Layouts, `generateMetadata`) and **API Route Handlers** must import from `apps/storefront/src/shared/services`.
   - API Routes will act as thin, lightweight controller wrappers. They parse incoming query params from `NextRequest`, invoke the shared cached service, and return the data as `NextResponse.json()`.
4. **Bypass DB Authentication at Build Time**:
   - Utilizing cached service calls during build-time rendering (e.g. metadata generation) allows the compiler to resolve data from the local build-cache without establishing live database sockets, avoiding synchronous cryptographic auth steps and preventing SSG compile failures.

## Architecture & Data Flow

```text
       [React Server Component]            [API Route Handler]
  (e.g., app/[locale]/products/page.tsx)  (e.g., api/products/route.ts)
                 │                                   │
                 │ (Import & Call)                   │ (Parse params & Call)
                 ▼                                   ▼
        ┌────────────────────────────────────────────────────────┐
        │        apps/storefront/src/shared/services/            │
        │               (Shared Service Layer)                   │
        │  - Wraps @nhatnang/database queries                    │
        │  - Applie "use cache", cacheLife(), cacheTag()         │
        └──────────────────────────┬─────────────────────────────┘
                                   │
                         (Cache Miss / Expiry)
                                   ▼
        ┌────────────────────────────────────────────────────────┐
        │                 @nhatnang/database                     │
        │         (Raw Postgres Queries via Drizzle)             │
        └────────────────────────────────────────────────────────┘
```

## Consequences

- **Positive (Sub-Millisecond Edge Performance)**: Heavy database queries are cached near the user in the Vercel Data Cache/CDN. High-traffic spikes read directly from the memory cache, shielding the database server from crash-inducing queries.
- **Positive (Perfect Data Consistency)**: The HTML shell rendered by Server Components and the JSON data fetched by API Routes share the exact same cache keys, eliminating hydration mismatches and mismatched data views.
- **Positive (SSG Build Safety)**: Static compilation no longer attempts live TCP connection authentication, bypassing SCRAM-SHA-256 random-byte generation, securing predictable and robust builds.
- **Positive (Separation of Concerns)**: API Routes are kept simple, dealing only with HTTP logic (parsing URL query strings, checking headers, returning responses) instead of inline data access and caching logic.
- **Negative (Maintenance Overhead)**: Requires maintaining storefront-specific service wrappers alongside database package services.
- **Negative (Serialization Constraints)**: Developers must ensure all arguments passed to services are primitives or plain objects. Passing complex structures (like custom class instances or Request objects) will fail compilation.

### Explicit Tradeoffs

- **Shared Caching Layer vs. Raw DB Direct Query**: We trade slightly higher architectural complexity (writing storefront-specific service files and mapping functions) to achieve sub-millisecond page speed and database shielding under high traffic.
- **Serialization Constraints vs. Custom Objects**: We trade developer flexibility (restricting service arguments strictly to serializable primitives) to achieve automated, error-free Next.js 16 cache key generation.
