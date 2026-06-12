# 11. Multilingual Database Schema Design: Localized Columns vs. JSONB

Date: 2026-06-12

## Status

Accepted

## Context

To support internationalization (i18n) for dynamic database content (e.g., product names, short descriptions, and category names), we must modify our database schema to store both Vietnamese (`vi`) and English (`en`) text/rich-text.

We considered two primary architectural approaches for database storage:

1. **Option A: Localized Columns** (Separate database columns, e.g., `name_vi` and `name_en`).
2. **Option B: Single JSONB Column** (A single `name` JSONB column storing a dictionary, e.g., `{ "vi": "Máy phát điện", "en": "Generator" }`).

## Decision

We will implement **Option A: Localized Columns** (`name_vi`, `name_en`, `description_vi`, `description_en`) across the `product`, `category`, and `brand` tables.

We rejected the JSONB approach (Option B) for the following reasons:

### 1. Type Safety and Drizzle ORM Ergonomics
- Drizzle ORM provides native type inference for primitive columns. If we define `nameVi: text().notNull()` and `nameEn: text()`, TypeScript automatically infers the select types as `string` and `string | null` respectively.
- Using a JSONB column (`name: jsonb()`) requires casting the column to a custom TypeScript type (e.g., `{ vi: string; en?: string }`). Drizzle treats this as a black-box JSON field, losing compile-time safety. For example, during insert or update operations, Drizzle cannot enforce that the `vi` key is present, making it easier for invalid payloads to bypass compiler checks.

### 2. Database Indexing and Performance
- **Sorting**: E-commerce catalogs require alphabetical sorting by name (e.g., `ORDER BY name_vi ASC`). Standard text columns are indexed natively using B-Tree indexes, making sorting extremely fast. Sorting by a nested JSONB path (`ORDER BY name->>'vi'`) is CPU-intensive because PostgreSQL must parse the JSONB structure of every row at runtime unless complex functional indexes are declared.
- **Faceted Search and Filtering**: Standard text columns are easier to index and search. Full-text search (FTS) queries can easily build vectors on flat columns (e.g., `to_tsvector('vietnamese', name_vi)`). Building FTS vectors on nested JSONB keys is complex and harder to maintain in Drizzle migrations.

### 3. Data Integrity & Database Constraints
- With localized columns, we can enforce `NOT NULL` constraints directly at the database level on the primary language (`name_vi: text().notNull()`).
- Enforcing that the Vietnamese translation is always present in a JSONB column requires writing custom PostgreSQL check constraints:
  ```sql
  ALTER TABLE product ADD CONSTRAINT chk_name_vi_present CHECK (name ? 'vi' AND name->>'vi' <> '');
  ```
  These raw SQL constraints are harder to declare, maintain, and migrate within Drizzle schemas.

### 4. Admin Form Ergonomics
- Admin dashboard forms (built with React Hook Form and Zod) map inputs 1-to-1 with schema properties. 
- Using flat properties (`nameVi`, `nameEn`) maps natively to form components, avoiding nested state mutations and complex nested Zod schemas (e.g., `z.object({ name: z.object({ vi: z.string(), en: z.string() }) })`).

## Consequences

- **Positive (Strong Type-Safety)**: Database inserts and updates are fully checked by the TypeScript compiler. No invalid or half-translated records can be saved accidentally.
- **Positive (High Performance)**: Catalog queries can sort, index, and query product names using standard B-Tree indexes without JSON parsing overhead.
- **Positive (Simple Migrations)**: Generating and applying migrations via Drizzle Kit is straightforward and uses standard SQL column additions.
- **Negative (Less Schema Flexibility)**: Adding a third language (e.g., Japanese) in the future will require running a database migration to add new columns (`name_ja`, etc.). However, because this storefront is localized strictly for Vietnam (Vietnamese and English), the likelihood of adding more languages is extremely low, making this tradeoff highly acceptable.

### Explicit Tradeoffs

- **Flat Localized Columns vs. Flexible JSONB**: We trade the schema flexibility of adding new languages on-the-fly without migrations (Option B) for compile-time type safety, B-Tree index sorting performance, and cleaner SQL query semantics (Option A).
- **Database-level Constraint Rigor vs. Schema Compactness**: We trade database-level constraint simplicity for strong `NOT NULL` guarantees on the primary language (`name_vi`), ensuring data completeness without resorting to complex database CHECK constraints.
