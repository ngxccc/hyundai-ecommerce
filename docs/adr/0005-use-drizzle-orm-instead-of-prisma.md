# 5. Use Drizzle ORM instead of Prisma

Date: 2026-06-04

## Status

Accepted

## Context

When designing the data access layer for this fullstack project, we needed a robust Object-Relational Mapping (ORM) or query builder to interface with our PostgreSQL database. The two primary candidates considered were:

1. **Prisma**: A highly popular database toolkit that relies on a schema file (`schema.prisma`) and generates a client backed by a Rust-based query engine.
2. **Drizzle ORM**: A lightweight, TypeScript-first ORM that allows developers to write SQL-like queries using standard TypeScript syntax.

Our platform has strict requirements around performance (especially serverless cold-start times), type safety, codebase simplicity, and full SQL control (e.g., executing complex joins, indexing, and utilizing JSONB columns for product details).

## Decision

We will **use Drizzle ORM** as our canonical ORM across the workspace instead of Prisma.

Drizzle will manage our schemas (defined in `packages/database/src/schemas/`), migrations (via `drizzle-kit`), and database connections. All database queries, transactions, and relational data mappings will be implemented through Drizzle's query builder.

## Consequences

- **Positive (Cold Starts & Performance)**: Drizzle does not compile down to a heavy Rust query engine binary. It is purely written in TypeScript/JavaScript, resulting in faster lambda cold starts and significantly reduced bundle sizes when deployed to serverless hosts like Vercel.
- **Positive (TypeScript Integration)**: Since Drizzle is TypeScript-first, table schemas act as the single source of truth for both database design and TypeScript types (using helpers like `InferSelectModel` and `InferInsertModel`). No separate code-generation step is strictly required to compile the app, which speeds up developer loops.
- **Positive (SQL-like Query Builder)**: Drizzle maps closely to actual SQL. Writing complex joins, database-level functions, or using PostgreSQL-specific features (like `JSONB` for `JSONContent` types) is straightforward and maintains full type safety.
- **Positive (Migration Control)**: Drizzle Kit generates plain SQL migrations, giving database administrators complete control over database evolution, rather than abstracting it into custom DSLs.
- **Negative (Ecosystem Familiarity)**: Prisma has a slightly larger community and visual tools (like Prisma Studio), though Drizzle Kit provides Drizzle Studio as a suitable replacement.
- **Negative (Active Schema Management)**: Changes in TypeScript schemas must be manually generated into migrations using `drizzle-kit generate`, though this is easily managed via `bun run db:generate`.

### Explicit Tradeoffs

- **SQL-like Controls vs. ORM Abstraction**: We trade Prisma's high-level database abstraction and automated relation mappings for Drizzle's SQL-like query structure, which results in faster execution and serverless cold starts but requires manually writing complex joins.
- **TypeScript Schema Definition vs. Dedicated DSL**: We trade a separate dedicated schema language (`.prisma` file) for defining schemas in pure TypeScript, eliminating a code-generation compilation step but requiring manual migration file generation.
