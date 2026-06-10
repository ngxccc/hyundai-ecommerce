# 7. Next.js App Router and Server Actions for Backend Communication

Date: 2026-06-04

## Status

Accepted

## Context

When structuring frontend-to-backend communication, traditional approaches involve writing custom API endpoints (e.g., Express/Fastify REST routes or GraphQL resolvers) and consuming them on the client using fetch libraries or React Query.

However, this architecture introduces overhead:

1. **Double Routing**: Creating an API route in Next.js just to fetch database entries, then creating a client-side fetcher.
2. **Type Duplication**: Manually defining client-side request and response types to match the API payload schema.
3. **Endpoint Proliferation**: Writing REST endpoints for simple operations (like updating product details or selecting order bids).

## Decision

We will **use Next.js App Router** with **React Server Components (RSC)** for data fetching, and **Next.js Server Actions (`"use server"`)** for data mutations (form submissions, status updates, actions).

- **Data Fetching**: Server Components will import database services (from `@nhatnang/database`) directly to fetch data during server-side rendering, bypassing HTTP API boundaries.
- **Data Mutations**: Client components will call Server Actions (compiled to secure POST endpoints) for any operations that mutate state. These actions return typed responses (e.g., success status, DTO payloads, or validation error maps).

## Consequences

- **Positive (Reduced Network Overhead)**: Since Server Components render on the server, data fetching from PostgreSQL happens directly over database connections rather than making additional client-to-server HTTP API requests.
- **Positive (Single Type Source of Truth)**: Server Actions are typed functions. Client components call them with TypeScript compile-time guarantees, eliminating the need to write client-side API payload schemas.
- **Positive (Security)**: Server Actions run exclusively on the server. They are automatically compiled with security safeguards, ensuring database clients and credential verification logic are never sent to the client browser.
- **Positive (Seamless Form Validation)**: Server Actions integrate naturally with Zod resolvers and React's form hooks, allowing validation errors to be returned as key-value maps and rendered inline.
- **Negative (Limited Client-Side Cache Control)**: Bypassing React Query/SWR means client-side caching must be managed using Next.js caching primitives (like `revalidatePath` and `revalidateTag`), which can sometimes be complex to orchestrate.
- **Negative (Testing Overhead)**: Testing React Server Actions requires mocking Next.js routing context (like headers, cookies, and searchParams) or testing them purely as standard asynchronous JS functions.

### Explicit Tradeoffs

- **Direct Database Access vs. Granular Client Caching**: We trade using client-side query libraries (like React Query/SWR) for importing DB services directly inside Server Components, eliminating REST endpoints but moving caching controls to Next.js layout primitives.
- **Security Enforcement vs. Unit Testing Simplicity**: We trade REST API endpoint mock-ability for compile-time secure Server Actions, which guarantees credentials are kept safe but requires mocking request context (cookies, headers) during unit testing.
