# 9. Relational Translation Tables and System-Wide Locale Resolution Standards

Date: 2026-09-13

## Status

Accepted

## Context

A recurring question arose during B2B backend query optimizations:

> _"If Vietnamese (`vi`) is already the default system language, why do internal queries (e.g. Quotes, Orders, Warehouse, Excel exports) explicitly require `eq(productTranslations.locale, 'vi')` in their SQL joins?"_

This question highlights a critical misunderstanding between **Application-level UI locale defaults** and **Relational Database Row Cardinality**. Without an explicit architectural standard, developers risk introducing severe data duplication bugs or writing inconsistent fallback queries.

### The Relational Join Hazard: Cartesian Product & Row Duplication

The catalog domain (`products`, `categories`, `brands`) implements the **Relational Translation Table Pattern (Model B)** established in ADR 0001:

- `products`: Stores language-agnostic physical and commercial attributes (`id`, `slug`, `price`, `totalStockCache`, `dimensions`, `weight`, etc.).
- `product_translation`: Stores linguistic attributes with a composite primary key `(product_id, locale)` (`name`, `shortDescription`, `description`, `seoTitle`, `seoDescription`).

When a product has translations in both Vietnamese (`vi`) and English (`en`), executing a naive join:

```sql
-- DANGEROUS: Produces Cartesian product when multiple locales exist!
SELECT p.id, pt.name, p.price
FROM products p
LEFT JOIN product_translation pt ON p.id = pt.product_id;
```

PostgreSQL matches **2 distinct rows** for a single product tuple ($1 \times 2 = 2$). In financial, quoting, or warehouse calculations:

1. `quote_items` joined with `products` will duplicate line items, inflating quote subtotals, VAT amounts, and stock deduction counts.
2. Excel exports will print duplicate rows for every multilingual product.
3. Pagination (`LIMIT`, `OFFSET`) will split single products across multiple page boundaries.

Therefore, in SQL relational algebra, specifying `AND translation.locale = DEFAULT_LOCALE` is **not an arbitrary linguistic preference**; it is an **absolute relational invariant** required to constrain the join relationship from $1:N$ to strictly $1:1$.

---

## Decision

We formalize the architectural standards for translation schemas, locale constants, SQL query patterns, and commercial transaction snapshots across the platform:

### 1. Centralized System-Wide Locale Constants

Hardcoding raw string literals like `"vi"` or `"en"` in business logic and queries is strictly prohibited. All packages MUST reference centralized constants defined in `@/common/constants/locale.constant`:

```ts
// backend/src/common/constants/locale.constant.ts
export const SUPPORTED_LOCALES = ["vi", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * System-wide primary locale for legal documents, internal calculations,
 * and database queries when no client locale is requested.
 */
export const DEFAULT_LOCALE: SupportedLocale = "vi";
```

### 2. Domain Separation: Dynamic Catalog vs Immutable Commercial Snapshots

The platform enforces a strict architectural boundary between dynamic catalog entities and commercial transaction documents:

| Domain          | Entity                             | Strategy                      | Translation Table?        | Rationale                                                                                                                                         |
| :-------------- | :--------------------------------- | :---------------------------- | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Catalog**     | `products`, `categories`, `brands` | Relational Translation Table  | **YES** (`*_translation`) | Dynamic multilingual content, locale-specific SEO URLs, localized marketing copy.                                                                 |
| **Commercial**  | `quotes`, `quote_items`            | Immutable Historical Snapshot | **NO**                    | Legal quotation proposals must lock the agreed item name at quotation time (`quote_items.itemName`).                                              |
| **Fulfillment** | `orders`, `order_items`            | Immutable Historical Snapshot | **NO**                    | Legally binding purchase contracts must preserve the exact purchased product name (`order_items.productName`) even if catalog names change later. |

**Strict Rule**: Never join `order_items` or approved `quote_items` dynamically with `product_translation` to render order history or invoices. Always read from the snapshot column (`productName` / `itemName`).

### 3. Query Standards: Internal Operational Processing vs Public Storefront

#### A. Internal Domain Operations (Quotes, Orders, Warehouse, Excel)

Internal commercial operations always operate in the primary legal business language (`DEFAULT_LOCALE`). All SQL joins MUST constrain the translation table using the join predicate:

```ts
import { DEFAULT_LOCALE } from "@/common/constants/locale.constant";

// Correct: Preserves strict 1:1 join cardinality
const items = await db
  .select({
    item: adminQuoteItemColumns,
    product: {
      id: products.id,
      name: sql<string>`coalesce(${productTranslations.name}, '')`,
      slug: products.slug,
      price: products.price,
    },
  })
  .from(quoteItems)
  .leftJoin(products, eq(quoteItems.productId, products.id))
  .leftJoin(
    productTranslations,
    and(
      eq(products.id, productTranslations.productId),
      eq(productTranslations.locale, DEFAULT_LOCALE), // Mandatory 1:1 constraint
    ),
  )
  .where(eq(quoteItems.quoteId, quoteId));
```

#### B. Public Storefront Catalog APIs (Client-Requested Locale with Fallback)

Public storefront endpoints accept an optional requested `locale`. If a product lacks translation in the requested language (e.g. English `en`), queries MUST implement the Fallback Pattern:

1. Attempt to fetch requested locale translation.
2. Fallback gracefully to `DEFAULT_LOCALE` (`vi`).
3. Never return empty or broken content.

```ts
// Storefront catalog SQL pattern with default locale fallback
const [product] = await db
  .select({
    id: products.id,
    name: sql<string>`coalesce(t_req.name, t_def.name, '')`,
    description: sql<string>`coalesce(t_req.description, t_def.description, '')`,
  })
  .from(products)
  .leftJoin(
    productTranslations,
    and(
      eq(products.id, productTranslations.productId),
      eq(productTranslations.locale, requestedLocale),
    ),
  )
  .leftJoin(
    productTranslations,
    and(
      eq(products.id, productTranslations.productId),
      eq(productTranslations.locale, DEFAULT_LOCALE),
    ),
  )
  .where(eq(products.id, productId));
```

---

## Consequences & Trade-offs

### Positive

- **Eliminates Data Duplication**: Guarantees that internal joins never produce Cartesian product row inflation.
- **Architectural Clarity**: Clear distinction between why catalog tables need `product_translation` and why commercial tables (`quote_items`, `order_items`) use snapshot text columns.
- **Audit & Accounting Compliance**: Guarantees invoices and approved B2B quotes cannot be retroactively altered by catalog content edits.
- **Maintainability**: Centralizes locale configuration into `locale.constant.ts`, eliminating scattered string literals.

### Negative & Mitigations

- **Double Join Fallback Overhead**: Multi-language fallback queries require two joins against `product_translation`.
  - _Mitigation_: Use Redis caching for public storefront product detail and category listings. For internal batch operations, always query `DEFAULT_LOCALE` directly with a single join.
