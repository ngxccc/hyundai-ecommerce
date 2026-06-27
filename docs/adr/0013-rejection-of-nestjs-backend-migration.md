# 13. Rejection of NestJS Backend Migration

Date: 2026-06-26

## Status

Accepted

## Context

We evaluated whether to migrate our backend architecture from the current direct database service design to a separate, complete NestJS backend application.

Currently, our codebase runs as a Turborepo monorepo where `@nhatnang/database` acts as a shared package containing raw database services, schemas, and DTOs. Both `apps/storefront` and `apps/admin` are Next.js applications that import these services directly, running database queries in-process within React Server Components (RSCs) and Server Actions.

Additionally, as established in **ADR 0010** (Storefront Caching and Shared Services Architecture), we utilize Next.js 16's Cache Components model (`"use cache"`, `cacheLife`, `cacheTag`) wrapped around our database service calls at the storefront level. This ensures sub-millisecond edge rendering, protects the database from query spikes, and guarantees data consistency. Furthermore, **ADR 0002** (Pure Service Architecture) decoupled our business logic into pure, framework-agnostic TypeScript service singletons.

We weighed the proposed NestJS migration against our current architecture, specifically looking at:

1. Architectural modularity (OOP architecture in NestJS vs. our lightweight, constructor-injected services).
2. The "two-request" network overhead (browser -> Next.js -> NestJS -> DB) vs. single-process queries.
3. Cache optimization using Next.js `"use cache"` vs. NestJS cache managers.

## Decision

We decide to **maintain the current Next.js Direct Service Architecture** and **reject the migration to a NestJS backend** for the storefront and admin systems.

The reasons for this decision are:

1. **Avoidance of the Double Network Hop**: NestJS would introduce an HTTP/gRPC network boundary between Next.js and the database. For dynamic reads (such as checkout, real-time Quote/Deal negotiations for Dealers, Contractors, Distributors, and End users) and all write operations (Server Actions, mutations), this adds a mandatory network hop, increasing latency by 10ms–50ms.
2. **Duplication of Caching Complexity**: Next.js already caches service responses at the edge via `"use cache"`. If we introduced NestJS, caching at the NestJS level would be redundant. Caching at the Next.js level while fetching from NestJS would require a complex cross-service cache invalidation mechanism (e.g., NestJS triggering Next.js revalidation endpoints).
3. **Modularity without Framework Overhead**: Our current service layer (`packages/database/src/services`) already provides a highly modular, interface-driven, constructor-injected architecture (symmetrical to NestJS patterns but without the runtime decorator overhead).
4. **Operational Simplicity**: A NestJS backend would require maintaining a separate application instance, containerization, deployment pipelines, and independent environment management, significantly increasing operational overhead for no material gain.

If we need to support external clients (e.g., mobile apps) or third-party API consumers in the future, we will expose typesafe APIs directly from Next.js Route Handlers (using a lightweight solution like tRPC or Hono) or spin up a dedicated microservice only for those specific integrations, rather than converting our entire backend to NestJS.

## Consequences

- **Positive (Latency Minimization)**: Server Components and Server Actions continue to query the database directly in-process with zero network/HTTP serialization overhead.
- **Positive (Unified Caching Model)**: Caching is declared and managed in-process using Next.js 16's native `"use cache"` compiler features, aligning with the decisions in ADR 0010.
- **Positive (Low Operational Overhead)**: The monorepo retains its streamlined structure, making builds, local development, and production deployments simpler.
- **Negative (Storefront Cache Wrapper)**: We must continue to maintain storefront-specific cache wrappers (`apps/storefront/src/shared/services`) to bridge the `@nhatnang/database` services with Next.js edge caching, but this is a minor tradeoff for the performance benefits.
