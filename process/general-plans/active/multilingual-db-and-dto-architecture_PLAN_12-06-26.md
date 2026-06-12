# Multilingual Database Content and DTO Mapping Architecture Plan

**Date**: June 12, 2026
**Complexity**: COMPLEX (Cross-cutting / Multi-package)
**Implementation Approach**: Localization Columns + Centralized Storefront Mapping Services
**Execution Model**: Phase-by-Phase with Pre-Migration Verification and Typecheck Validation
**Status**: ⏳ PLANNED

---

## Overview

This implementation plan outlines the migration path for dynamic database content (products, categories, brands) to support multilingual internationalization (i18n) for Vietnamese and English locales. In addition, it establishes a standardized DTO (Data Transfer Object) architecture to decouple raw database schemas from presentation layers across both the `storefront` and `admin` apps.

This plan relies on the repository context defined in `process/context/all-context.md`.

---

## Touchpoints

- **Database Package (`packages/database`)**:
  - `packages/database/src/schemas/product.schema.ts`
  - `packages/database/src/schemas/category.schema.ts`
  - `packages/database/src/schemas/brand.schema.ts`
  - `packages/database/src/validators/product.validators.ts`
  - `packages/database/src/validators/category.validators.ts`
  - `packages/database/src/validators/brand.validators.ts`
  - `packages/database/src/dtos/product.dto.ts`
  - `packages/database/src/dtos/category.dto.ts`
  - `packages/database/src/dtos/brand.dto.ts`
- **Storefront App (`apps/storefront`)**:
  - `apps/storefront/src/shared/services/product.service.ts`
  - `apps/storefront/src/shared/services/category.service.ts`
  - `apps/storefront/src/shared/services/brand.service.ts`
  - `apps/storefront/src/features/products/...`
- **Admin App (`apps/admin`)**:
  - `apps/admin/src/features/...` (Forms, components, and validators)

---

## Public Contracts

### Database DTO Contracts

Standard DTO interfaces in `packages/database/src/dtos/` will be updated to output bilingual fields:

```typescript
// packages/database/src/dtos/product.dto.ts
export interface TProductDTO {
  id: string;
  nameVi: string;
  nameEn: string | null;
  slug: string;
  price: string;
  descriptionVi: Record<string, unknown> | null;
  descriptionEn: Record<string, unknown> | null;
  shortDescriptionVi: string | null;
  shortDescriptionEn: string | null;
  images: string[];
  brandId: string | null;
  categoryId: string | null;
  specs: TProductSpecs | null;
  totalStockCache: number;
  isQuoteOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Storefront Services Mapping Contracts

The Storefront Service Layer maps the database DTO into a localized storefront-specific ViewModel:

```typescript
// apps/storefront/src/shared/services/product.service.ts
export interface StorefrontProduct {
  id: string;
  name: string; // locale-resolved: nameEn ?? nameVi
  slug: string;
  price: string;
  description: Record<string, unknown> | null; // locale-resolved
  shortDescription: string | null; // locale-resolved
  images: string[];
  brandId: string | null;
  categoryId: string | null;
  specs: TProductSpecs | null;
  totalStockCache: number;
  isQuoteOnly: boolean;
}

export function mapDTOToStorefront(
  dto: TProductDTO,
  locale: "vi" | "en",
): StorefrontProduct {
  return {
    id: dto.id,
    name: locale === "en" && dto.nameEn ? dto.nameEn : dto.nameVi,
    slug: dto.slug,
    price: dto.price,
    description:
      locale === "en" && dto.descriptionEn
        ? dto.descriptionEn
        : dto.descriptionVi,
    shortDescription:
      locale === "en" && dto.shortDescriptionEn
        ? dto.shortDescriptionEn
        : dto.shortDescriptionVi,
    images: dto.images,
    brandId: dto.brandId,
    categoryId: dto.categoryId,
    specs: dto.specs,
    totalStockCache: dto.totalStockCache,
    isQuoteOnly: dto.isQuoteOnly,
  };
}
```

---

## Blast Radius

1. **Database Schema Migrations**:
   - Column renaming/additions will require writing a migration script via Drizzle Kit.
   - Existing tables must have columns mapped (`name` $\rightarrow$ `name_vi`) and new columns (`name_en`) initialized as nullable or empty strings.
2. **Admin Forms & Validations**:
   - Product creation, Category creation, and Brand creation forms in `apps/admin` will break due to missing fields and changed validation schemas. Every input form must be updated to show dual-language fields.
3. **Storefront Rendering**:
   - Every storefront component displaying product names, descriptions, or categories will throw type errors until mapped via the storefront mapping service.
4. **Seed Scripts**:
   - Developer seeding scripts must be updated to insert data into localized fields to prevent local database environments from starting with incomplete parameters.

---

## Phase Completion Rules

Every phase defined in this plan must be verified and checked in full before advancing to the next phase:

1. **Types Safety**: Running `bun turbo run check-types` must succeed with zero TypeScript compiler errors.
2. **Build Verification**: Pre-rendering and build verification for both storefront and admin applications must complete successfully.
3. **Post-Phase Testing**: After any database migration or schema modification, migrations must be validated by running a local migration and seed test.

---

## Acceptance Criteria

- **AC 1: Database Support**: The PostgreSQL database schema contains dedicated columns for both Vietnamese and English strings/JSONB (e.g. `name_vi`, `name_en`).
- **AC 2: Validation Enforcement**: Input validation schemas in `packages/database/src/validators/` enforce that Vietnamese translations are mandatory, and English translations are optional but validated for correctness.
- **AC 3: Storefront i18n Resolving**: Storefront product cards, detail pages, and search catalogs display the English content when the URL locale is `/en` (falling back to Vietnamese if English is empty), and Vietnamese content when the URL locale is `/vi`.
- **AC 4: Admin Form Completeness**: Administrators can input and edit both Vietnamese and English fields for products, categories, and brands from the Admin Dashboard, and changes persist correctly.
- **AC 5: Zero Regression**: Core features like product detail rendering, search filters (ADR #9), and cache components (ADR #10) continue to operate with zero regressions.

---

## Implementation Checklist

### Phase 1: Database Migration & Schema Upgrades

- [ ] Update Drizzle schema files in `packages/database/src/schemas/`:
  - `product.schema.ts` (rename `name`/`description`/`shortDescription` to `*Vi`, add `*En` columns).
  - `category.schema.ts` (rename `name`/`description` to `*Vi`, add `*En` columns).
  - `brand.schema.ts` (rename `description` to `descriptionVi`, add `descriptionEn` columns).
- [ ] Generate migrations using Drizzle Kit:
  - Run `bun --cwd packages/database drizzle-kit generate`.
  - Modify the generated SQL migration file to copy values from old columns to the new `_vi` columns to prevent data loss.
- [ ] Update developer seed scripts to populate both English and Vietnamese sample data.
- [ ] Run post-phase testing by applying migrations and seeding the local database.

### Phase 2: Refactoring Shared DTOs and Validators

- [ ] Update Zod schemas in `packages/database/src/validators/` to include validations for localized inputs.
- [ ] Update shared DTO definitions in `packages/database/src/dtos/` to expose bilingual properties.
- [ ] Verify database package typechecks correctly.

### Phase 3: Storefront Service Mapping Layer

- [ ] Define the mapped i18n interfaces and DTO-to-Storefront helper mapping functions in `apps/storefront/src/shared/services/types.ts` or in the services themselves:
  - `StorefrontProduct` (with localized `name`, `description`, `shortDescription`).
  - `StorefrontCategory` (with localized `name`, `description`).
  - `StorefrontBrand` (with localized `description`, keeping global `name`).
- [ ] Refactor `apps/storefront/src/shared/services/product.service.ts`:
  - `getProducts(locale, limit, options)`: fetch raw DTOs from database service, map to `StorefrontProduct[]`.
  - `getProductBySlug(locale, slug)`: fetch raw DTO, map to `StorefrontProduct | null`.
  - `getFiltersMetadata(locale)`: fetch raw DB metadata, resolve brand/category names to active locale, and return mapped filter metadata.
- [ ] Refactor `apps/storefront/src/shared/services/category.service.ts`:
  - `getCategories(locale)`: fetch categories, map to `StorefrontCategory[]`.
  - `getCategoryTree(locale)`: fetch tree, resolve names/descriptions, and return `StorefrontCategoryWithChildren[]`.
- [ ] Refactor `apps/storefront/src/shared/services/brand.service.ts`:
  - `getBrands(locale)`: fetch brands, resolve descriptions, and return `StorefrontBrand[]`.
- [ ] Pass the active `locale` (obtained from Next.js i18n routing parameters) to the storefront service calls in templates, pages, and components.

### Phase 4: Admin Forms and Controllers Updates

- [ ] Refactor forms and Zod validation schemas in `apps/admin` to support localized inputs.
- [ ] Add dual-input controls (Vietnamese and English) for product/category/brand forms.
- [ ] Save updated bilingual parameters to the database.

---

## Verification Evidence

Validation and testing instructions are aligned with the guidelines in `process/context/tests/all-tests.md` and `tests.md`:

### 1. Database Migration Verification

Run migrations and seeds locally:

```bash
bun --cwd packages/database db:migrate
bun --cwd packages/database db:seed
```

Verify via database client that columns `name_vi` and `name_en` are populated correctly.

### 2. Typecheck Validation

Ensure the entire monorepo compiled correctly:

```bash
bun turbo run check-types
```

Must exit with code 0.

### 3. Build & Static Generation Verification

Run production builds:

```bash
bun turbo run build --filter=storefront --filter=admin
```

Must compile and pre-render all static and partial-prerender (PPR) pages successfully.

---

## Resume and Execution Handoff

1. Locate this plan at `process/general-plans/active/multilingual-db-and-dto-architecture_PLAN_12-06-26.md`.
2. Ensure you have consulted `process/context/all-context.md` before making changes.
3. Start with **Phase 1: Database Migration & Schema Upgrades** by modifying the schema files in `packages/database/src/schemas/`.
4. Run the post-phase testing verification gates after each phase.

**Next Step**: Review this plan, approve for execution, then enter EXECUTE mode with the `ENTER EXECUTE MODE` command.
