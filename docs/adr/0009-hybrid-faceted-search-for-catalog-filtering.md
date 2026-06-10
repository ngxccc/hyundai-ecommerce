# 9. Hybrid Faceted Search for Catalog Filtering

Date: 2026-06-10

## Status

Accepted

## Context

Faceted search (dynamic filtering) is an essential E-commerce user experience that dynamically disables or enables filter checkboxes based on the current selection, preventing "zero-results" states.

However, implementing this in a Next.js fullstack application presents architectural tradeoffs:

1. **Pure Server-Side Facet Aggregation**:
   - _Mechanism_: Every click on a filter checkbox triggers a request to the server, which runs database grouping/aggregation queries on the filtered product subset (specifically extracting fields from a JSONB `specs` column).
   - _Tradeoff_: Extremely high CPU load on the database for complex aggregation. Higher network latency (50ms - 200ms) on every click, creating a sluggish user interface.
2. **Pure Client-Side State Filtering**:
   - _Mechanism_: The catalog state is kept in local React state or a store (e.g., Zustand) and filtered on the client.
   - _Tradeoff_: Eliminates URL synchronization. Users lose the ability to share deep links of filtered views, bookmark searches, or utilize the browser's back/forward buttons. It also prevents search engines from indexing filtered catalog states (destroying SEO).

## Decision

We will implement a **Hybrid Faceted Search** approach to catalog filtering:

1. **Lightweight Metadata Payload**:
   - The server will serve a lightweight JSON payload of **all active products** (containing only `id`, `categoryId`, `brandId`, and the key specifications used for filtering: `power`, `fuelType`, `phase`, `voltage`, `engineBrand`, `alternatorBrand`).
   - This payload is statically built or cached at the CDN/Server level using Next.js caching primitives (`revalidate = 3600`) so that loading it does not hit the database during runtime.
2. **Client-Side Facet Computation (Instant UX)**:
   - On the client side, the filter component (`ProductFilters`) will keep this metadata in memory.
   - Whenever a filter checkbox is toggled, the component instantly calculates in Javascript (takes `< 1ms` in memory) which other checkboxes should be enabled or disabled based on the remaining products.
3. **Controlled URL State Synchronization**:
   - The active filter state is synchronized with the URL search parameters to preserve deep linking, bookmarking, and back button support.
   - On desktop, the synchronization is live but protected by a debounce helper to prevent feedback loops. On mobile, the synchronization is deferred until the user clicks "Apply" inside the sheet.
4. **Paginated Content Fetching (SSR/SEO)**:
   - The actual product list (containing full images, descriptions, and pricing) is rendered on the server for the first page (SSR/SEO).
   - Subsequent paginated results are fetched dynamically from the Server database using paginated database queries based on the active URL parameters.

## Data Flow Diagram

```text
[User Page Load]
       │
       ├─► Server-Side: Fetch first page of products (12 items) with full details
       │   (images, pricing, etc.) and render initial HTML (Optimized for SEO/Crawlers).
       │
       └─► Server-Side: Load lightweight metadata for all active products
           (IDs, categoryId, brandId, specs) and hydrate into a client-side JSON cache.
       │
[User Interacts with Filter Sidebar (Client-Side)]
       │
       ├─► Client JS runs facet matching algorithm on local JSON metadata in memory (< 1ms).
       │   │
       │   └─► Sidebar immediately disables/hides checkboxes for options
       │       that have 0 matching products.
       │
       └─► URL SearchParams are updated (live on desktop / on "Apply" click on mobile).
           │
           └─► Next.js triggers dynamic Server Component transition.
               │
               └─► Server queries DB (SELECT with limit + active filters) and returns
                   new page of fully populated product cards (Cloudinary URLs, pricing).
```

## Consequences

- **Positive (0ms UI Feedback)**: Users experience zero latency when checking filters. Incompatible options are disabled instantly without waiting for network responses.
- **Positive (Zero Database CPU Overhead for Faceting)**: The database is completely shielded from complex aggregation queries (like SQL `GROUP BY` or regex parsing on JSONB columns). It only runs standard paginated SELECT queries.
- **Positive (Perfect SEO and Page Hydration)**: The initial page load is fully rendered as HTML on the server. Search engines see a complete catalog of the first page of products.
- **Positive (Shareability and Native Routing)**: Filter combinations are saved in the URL query string, maintaining shareable links and standard back/forward navigation.
- **Negative (Initial Payload Overhead)**: The lightweight metadata JSON must be downloaded on page load. While negligible for our current catalog size (~50KB for 1,000 products), it could scale to 1-2MB if the catalog exceeds 30,000+ products, which would require migrating to category-level static facet caching in the future.
- **Negative (Implementation Complexity)**: Requires maintaining synchronization between the URL state, the local input values, and the memory-based facet matching algorithm.

### Explicit Tradeoffs

- **Initial Page Load Weight vs. Client Interactive Speed**: We trade a slightly larger initial page payload (an extra 50KB static JSON metadata file downloaded once) to achieve instant 0ms visual feedback on the filter checkboxes.
- **Database CPU Load vs. Client RAM/CPU Consumption**: We shift the heavy computation of dynamic facets (calculating which checkbox combos are available) from the central PostgreSQL database server to the user's web browser RAM/CPU.
- **State Sync Complexity vs. Standard Server-side Navigation**: We trade writing more complex state-sync code (managing debounced inputs and local vs URL states to avoid feedback loops) for avoiding full page reloads and database queries on every filter click.
