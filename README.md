# Hyundai Ecommerce

## B2B E-commerce Platform for Industrial Equipment

A modern, high-performance B2B e-commerce system specialized in heavy machinery and industrial power generators (Hyundai, Mitsubishi, Kubota, etc.), built with a focus on complex quote negotiation, multi-warehouse logistics, and enterprise-grade architecture.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B67F?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-FF6B00?logo=drizzle&logoColor=white)](https://orm.drizzle.team)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

---

## Live Sites

- **Main Storefront**: [https://hyundainhatnang.ngxc.io.vn](https://hyundainhatnang.ngxc.io.vn)
- **Admin Dashboard**: [https://admin.hyundainhatnang.ngxc.io.vn](https://admin.hyundainhatnang.ngxc.io.vn)
- **Technical Documentation**: [https://docs.hyundainhatnang.ngxc.io.vn](https://docs.hyundainhatnang.ngxc.io.vn)

---

## Key Features

- Advanced product filtering on technical specifications (JSONB)
- Full B2B quote negotiation workflow (Request -> Review -> Final Price -> Payment)
- Multi-warehouse inventory with real-time stock management
- Dealer tier-based automatic pricing
- Secure guest + user cart with concurrency control
- Auto-generated technical documentation (Fumadocs)
- End-to-end type safety from database to frontend
- Internationalization (i18n): Fully localized in English and Vietnamese using Next-Intl
- Admin Panel: Secure dashboard for managing products, quotes, categories, and users

---

## Tech Stack

The application uses the following technologies:

- **Framework**: Next.js 16.2.6 (App Router + React Server Components) & React 19
- **Runtime**: Bun (v1.3.6)
- **Monorepo Orchestration**: Turborepo (v2.9.16)
- **Database ORM**: Drizzle ORM (v1.0.0-rc.3) targeting Neon Serverless PostgreSQL
- **Authentication**: Better Auth (v1.6.11)
- **Validation**: Zod (v4.4.3)
- **Testing**: Bun Test (`bun:test`)
- **Internationalization**: Next-Intl (Vietnamese & English)
- **Documentation**: Fumadocs
- **UI Components**: shadcn/ui (v4.8.3) + Tailwind CSS v4, Lucide React icons, next-themes
- **State Management**: Zustand
- **Secrets Management**: Doppler
- **Background Jobs**: Inngest
- **Caching & Rate Limiting**: Upstash Redis + Upstash Ratelimit

---

## Monorepo Architecture

The repository is structured as a Turborepo monorepo with separated workspaces to keep the codebase modular, decoupled, and maintainable.

### Applications (apps/)

- **apps/storefront**: The customer-facing e-commerce portal where users browse industrial power systems, manage carts, configure specifications, and request B2B quotes. Built using Next.js 16 and Next-Intl.
- **apps/admin**: The internal admin dashboard for managing catalog entities (products, categories, brands), adjusting dealer pricing tiers, tracking warehouse stock, and handling B2B quote and deal negotiations.
- **apps/docs**: Technical documentation website bootstrapped with Fumadocs, providing developers and operators with platform integration details.

### Shared Packages (packages/)

- **packages/database**: The central source of truth for the database layer. It contains Drizzle schemas, migrations, seed scripts, service logic implementing the Fat Service pattern (constructor dependency injection), database validation schemas, and database-to-application DTO mappings.
- **packages/ui**: A shared UI component package containing common shadcn/ui components configured for Tailwind CSS v4, custom utility hooks (e.g., debouncing), file utilities, and the rich text editor.
- **packages/types**: Houses shared TypeScript interfaces and types, such as standard API responses, authentication helper types, and action result unions (`TActionResult`).
- **packages/shared**: Contains shared constants (HTTP codes, quote status strings, system error codes), shared mock systems for testing, and helper utilities like the rate-limiter wrapper using Upstash Redis.
- **packages/typescript-config**: Centralized TypeScript configuration files (`base.json`, `library.json`, `next.json`) reused across workspaces.
- **packages/eslint-config**: Shared ESLint configuration configurations for codebase consistency.

---

## Bilingual Database & Presentation DTO Layer

To support seamless Vietnamese (VI) and English (EN) localization, the platform is designed with localized fields at the database schema level and dynamic fallback resolution at the presentation/DTO mapping level.

### Database Schema Structure

Localized fields for text and rich content are separated into specific columns for each language. For example, in `packages/database/src/schemas/product.schema.ts` (and similarly for categories, brands, and warehouses):

- **Vietnamese (VI) fields**: Marked as `notNull()` (e.g., `nameVi: text().notNull()`) to establish the required baseline for all content entries.
- **English (EN) fields**: Optional and nullable (e.g., `nameEn: text()`), allowing English translations to be filled in incrementally.
- **Rich Text Fields**: Columns like `descriptionVi` and `descriptionEn` are defined as `jsonb().$type<JSONContent>()` using Tiptap structure.

### DTO Mapping Layer

To enforce clean application boundaries, raw database rows are converted into structured Data Transfer Objects (DTOs) via mapping functions located in `packages/database/src/dtos/` (such as `mapProductToDTO`, `mapCategoryToDTO`, `mapBrandToDTO`, and `mapWarehouseToDTO`). These mappings clean and normalize raw database outputs before they travel to services or API boundaries.

### Vietnamese-as-Fallback Presentation Resolution

When rendering data inside the user-facing storefront or administrative dashboard, localized fields are resolved dynamically based on the active session locale. In `apps/storefront/src/shared/services/types.ts`:

```typescript
export function mapProductToStorefront(
  dto: TProductDTO,
  locale: Locale,
): StorefrontProduct {
  return {
    id: dto.id,
    name: locale === "en" && dto.nameEn ? dto.nameEn : dto.nameVi,
    description:
      locale === "en" && dto.descriptionEn
        ? dto.descriptionEn
        : dto.descriptionVi,
    shortDescription:
      locale === "en" && dto.shortDescriptionEn
        ? dto.shortDescriptionEn
        : dto.shortDescriptionVi,
    // ...other fields
  };
}
```

#### Fallback Rules

1. If the current locale is `"en"` and the English translation column (e.g., `nameEn`) is populated and non-empty, the English translation is displayed.
2. If the current locale is `"vi"`, or if the English field is null, undefined, or empty, the platform dynamically falls back to the Vietnamese value (e.g., `nameVi`). This configuration ensures that the UI never displays blank content for untranslated fields.

---

## Rich Text Editor Specifications

The platform provides a custom Tiptap-based Rich Text Editor (`RichTextEditor`) implemented within `packages/ui` at `src/editor/index.tsx`.

### Editor Features

- **Core Extensions**: Built using `@tiptap/react` and configured with `StarterKit` (handling lists, marks, headings, and configured with `openOnClick: false` for links).
- **Custom Image Support**: Integrates custom Image components, image bubble menu overlays, and an image cropper (`react-image-crop`) to allow on-the-fly resizing, cropping, and uploading of visual assets.
- **UI & Styling**: Outfitted with a custom top toolbar, an optional toggle for formatting guide characters (`showInvisibles`), and styled using custom Prose typography classes (`prose dark:prose-invert prose-sm sm:prose-base`).
- **Data Contract**: Communicates updates back to form state via a structured `JSONContent` format from `@tiptap/core`.

### Re-Export and Type Definition

To prevent direct package dependencies on editor internals outside the UI package, the underlying `JSONContent` type is re-exported at the main entry point:

```typescript
// packages/ui/src/index.ts
export { type JSONContent } from "@tiptap/core";
```

Within database schemas or validator structures, this type is used directly to define rich content columns (e.g., `descriptionVi: jsonb().$type<JSONContent>()`).

---

## Getting Started

### Prerequisites

- **Bun**: v1.3.6 or later
- **Doppler CLI**: Used to manage and inject secrets/environment variables during development and build tasks.

### Local Development Setup

1. **Authenticate Doppler** and connect the CLI to the project configurations:

   ```bash
   doppler login
   doppler setup
   ```

2. **Install monorepo dependencies**:

   ```bash
   bun install
   ```

3. **Database Setup**:
   Generate database schemas, apply migrations, and populate seeds inside the development database:

   ```bash
   # Generate migrations based on schemas
   bun run db:generate

   # Apply pending migrations to database
   bun run db:push

   # Seed the database with initial categories, products, and admin users
   bun --filter=@nhatnang/database run db:seed
   ```

4. **Launch development servers**:

```bash
   # Run all apps simultaneously with Doppler injected environment variables
   bun run dev
```

To run individual applications independently, use Turborepo filters:

```bash
# Run the customer storefront app
bun run dev:storefront

# Run the admin dashboard app
doppler run -- turbo run dev --filter=admin

# Run the documentation site
doppler run -- turbo run dev --filter=docs
```

---

## Monorepo Scripts

The following scripts are exposed at the workspace root `package.json`:

- `bun run dev`: Runs all development servers concurrently using Doppler secrets.
- `bun run dev:storefront`: Focuses development only on the customer-facing storefront app.
- `bun run build`: Compiles all monorepo applications and packages for production.
- `bun run check-types`: Runs TypeScript validation checks (`tsc --noEmit`) across all applications and shared packages.
- `bun run lint`: Analyzes codebase quality and formatting standards via ESLint.
- `bun run test`: Executes the test suites across all workspaces using the Turborepo test pipeline.
- `bun run clean`: Cleans compiler caches and outputs (deletes local `.next`, `.turbo`, and `node_modules` folders).
- `bun run clean:hard`: Cleans all workspaces deeply, drops lockfiles, and triggers a fresh `bun install`.
- `bun run deps:lint`: Checks for package dependency inconsistencies across different monorepo workspaces via syncpack.
- `bun run deps:fix`: Standardizes and fixes dependency mismatches across workspaces.
- `bun run format:pkg`: Sorts and formats all workspace `package.json` files for clean organization.
