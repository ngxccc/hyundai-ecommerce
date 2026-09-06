# 1. Architectural Evaluation & Tradeoffs of the Translation Table Pattern (Model B) for Multilingual Catalog

Date: 2026-09-06

## Status

Proposed / Under Evaluation

## Context

The Hyundai E-commerce platform currently uses a **Column-per-Locale pattern (Model 0)** in `product.schema.ts` and `category.schema.ts`:

- Columns: `nameVi: text().notNull()`, `nameEn: text()`, `descriptionVi: jsonb()`, `descriptionEn: jsonb()`.

### The Problem

1. **Schema Rigidity & Migration Churn**: Supporting additional languages (e.g., Korean `ko`, Japanese `ja`, Chinese `zh`) requires running `ALTER TABLE` migrations across all translatable tables (`products`, `categories`, `brands`), updating DTO schemas, and modifying frontend forms.
2. **Rejection of JSONB Localization Dictionary (Model A)**: While JSONB (`name: jsonb().$type<Record<string, string>>()`) avoids migrations, it was rejected for this architecture due to:
   - **Lack of Relational Schema Integrity**: No database-level `NOT NULL` enforcement for specific required locales (e.g. Vietnamese primary locale).
   - **Weak Compile-Time Type Safety**: TypeScript treats it as an open dictionary (`Record<string, string>`), which easily permits missing keys, typoed language codes (`"vn"` instead of `"vi"`), and runtime undefined property access.
   - **Foreign Key & Uniqueness Impotence**: Impossible to place native SQL `UNIQUE (locale, slug)` constraints on JSON keys without complex expression indexes.

### Industry Reference Architecture

The Translation Table pattern is the battle-tested standard architecture across premier open-source enterprise e-commerce platforms:

1. **Saleor Commerce** (Python / PostgreSQL / GraphQL): Implements `ProductTranslation`, `CategoryTranslation`, and `CollectionTranslation` with compound primary key `(product_id, language_code)`.
2. **Sylius** (PHP / Symfony / Doctrine / PostgreSQL): Implements `ProductTranslation` entity implementing `TranslationInterface`. Core product contains business/invariant fields (price, inventory, code); all linguistic fields live in translations.
3. **Shopify & Medusa v2**: Use polymorphic translation storage (`TranslationModule`) associating translation records by `resource_id`, `locale`, and `attribute`.

---

## Decision

Extract all translatable attributes into dedicated 1-to-N relational translation tables:

- `products` $\rightarrow$ `product_translations`
- `categories` $\rightarrow$ `category_translations`
- `brands` $\rightarrow$ `brand_translations`

### Structural Blueprint (PostgreSQL & Drizzle ORM)

```ts
import {
  pgTable,
  uuid,
  text,
  varchar,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { products } from "./product.schema";

export const productTranslations = pgTable(
  "product_translation",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    locale: varchar("locale", { length: 8 }).notNull(), // "vi", "en", "ko", "ja"
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (table) => [
    // Composite Primary Key guarantees exact 1:1 translation row per locale
    primaryKey({ columns: [table.productId, table.locale] }),
    // Unique index per locale ensures SEO URLs are unique within their language namespace
    uniqueIndex("product_translation_locale_slug_uq").on(
      table.locale,
      table.slug,
    ),
    // Performance index for lookup and join resolution
    index("product_translation_product_locale_idx").on(
      table.productId,
      table.locale,
    ),
  ],
);

export type ProductTranslation = typeof productTranslations.$inferSelect;
export type NewProductTranslation = typeof productTranslations.$inferInsert;
```

---

## Consequences

- **100% Strict Type Safety**: Full compile-time type inference via Drizzle ORM (`$inferSelect` / `$inferInsert`), eliminating untyped/runtime-fragile JSON dictionaries.
- **Relational Invariants**: Database engine directly enforces `NOT NULL` on required fields (`name`, `slug`) and `UNIQUE (locale, slug)` per language namespace.
- **Zero-Migration Multi-Language Scalability**: Adding future locales (e.g. Korean `ko`, Japanese `ja`, Chinese `zh`) requires zero `ALTER TABLE` migrations.
- **Invoice Snapshot Rule**: Retain `order_item.productName: text().notNull()` as an immutable historical snapshot of the exact localized name purchased by the customer at checkout time.
- **Search Stemming Quality**: Enables language-specific PostgreSQL Full-Text Search GIN indexes with appropriate linguistic stemmers (`simple` for Vietnamese, `english` for English).

### Explicit Tradeoffs

- **Strict Type Safety vs Query Complexity (Double Join Fallback Tax)**:
  - _Tradeoff_: In pure SQL, fetching a localized product with fallback requires two `LEFT JOIN`s (`t_req` for requested locale, `t_def` for default fallback) with `COALESCE(t_req.name, t_def.name)`.
  - _Mitigation_: Adopt parallel batch fetching (`inArray(productId, ids)`) with in-memory fallback resolution in NestJS ($O(1)$ dictionary map), eliminating N+1 cascades and avoiding join explosion across categories and brands.
- **Relational Integrity vs Write Complexity (Multi-Table Transactions)**:
  - _Tradeoff_: Creating or updating products changes from a single-table mutation into an atomic multi-table transaction across `products` and `product_translations` (`INSERT ... ON CONFLICT (product_id, locale) DO UPDATE`).
  - _Mitigation_: Encapsulate transactional multi-table upserts inside `ProductsService` and bind Admin forms to submit a localized array (`translations: [{ locale, name, slug, description }]`).
- **Master Table Compaction vs Tuple Header Overhead**:
  - _Tradeoff_: Translation tables incur PostgreSQL heap tuple headers (24 bytes per row) and index overhead.
  - _Mitigation_: The master `products` table sheds large text fields, reducing row size from ~2KB down to ~120 bytes. This dramatically increases the number of master product tuples per 8KB shared buffer page, accelerating inventory checks, price filters, and stock deduction row locks (`SELECT ... FOR UPDATE`).
- **Sorting on Localized Names vs Primary Ordering**:
  - _Tradeoff_: Alphabetical sorting (`ORDER BY name`) across joined translation tables cannot directly leverage B-Tree indexes on `products`.
  - _Mitigation_: Heavy equipment B2B catalog queries are predominantly sorted by Price, Capacity (kVA), or Date Added (all located on the compact master table). For high-volume storefront text search, use PostgreSQL Full-Text Search or dedicated search indexing.
