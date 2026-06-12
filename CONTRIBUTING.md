# Contributing Guide

Thank you for considering contributing to Hyundai Ecommerce! We welcome contributions from the community to help improve this B2B industrial equipment platform.

---

## Table of Contents

- [Contributing Guide](#contributing-guide)
  - [Table of Contents](#table-of-contents)
  - [Development Setup](#development-setup)
  - [Project Workspaces](#project-workspaces)
  - [Running the Project](#running-the-project)
  - [Coding & Architectural Guidelines](#coding--architectural-guidelines)
    - [1. TypeScript & Code Standards](#1-typescript--code-standards)
    - [2. Schema-Driven Design (SDD)](#2-schema-driven-design-sdd)
    - [3. Fat Service Pattern & Constructor DI](#3-fat-service-pattern--constructor-di)
    - [4. Zod Schema Separation](#4-zod-schema-separation)
    - [5. Test Co-location](#5-test-co-location)
    - [6. Next-Intl Keys Localization](#6-next-intl-keys-localization)
    - [7. Next.js API Routes & Prerender Re-throw](#7-nextjs-api-routes--prerender-re-throw)
    - [8. Admin Portal Layout Design](#8-admin-portal-layout-design)
  - [Commit Messages](#commit-messages)
  - [Pull Request Process](#pull-request-process)
  - [Reporting Issues](#reporting-issues)
  - [License](#license)

---

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ngxccc/hyundai-ecommerce.git
   cd hyundai-ecommerce
   ```

2. **Authenticate with Doppler CLI**
   Instead of copying manually configured local `.env` files, this repository utilizes Doppler for centralized secret management. Environment variables are automatically fetched and synced at runtime.
   ```bash
   # Log in to your Doppler account
   doppler login
   
   # Setup and link the local workspace directory to the Doppler project config
   doppler setup
   ```

3. **Install dependencies**
   ```bash
   bun install
   ```

---

## Project Workspaces

The codebase is organized as a Turborepo monorepo:

```bash
apps/
├── storefront/        # Customer-facing website (Next.js 16 + next-intl)
├── admin/             # Internal admin dashboard (Next.js 16 + next-intl)
└── docs/              # Technical documentation site (Fumadocs)

packages/
├── database/          # Drizzle ORM schemas, fat services, and migrations
├── ui/                # Shared components (shadcn/ui + Tailwind CSS v4) and rich text editor
├── types/             # Shared TypeScript types and contracts
├── shared/            # Shared utilities (rate limiters, constant configs, test mocks)
├── typescript-config/ # Shared TS config base profiles
└── eslint-config/     # Shared ESLint configuration profiles
```

---

## Running the Project

Run commands from the monorepo root:

```bash
# Start all workspace applications in development mode with Doppler secrets injected
bun run dev

# Or run individual applications directly:
bun run dev:storefront

# Run admin or docs via turbo filter
doppler run -- turbo run dev --filter=admin
```

---

## Coding & Architectural Guidelines

To maintain code quality, consistency, and type safety, all contributions must adhere to these engineering guidelines.

### 1. TypeScript & Code Standards
- **Strict Mode**: Strict mode is enabled. All code must be type-safe.
- **No Implicit/Explicit 'any'**: Using `any` is strictly prohibited in the codebase. Use specific types, generics, or `unknown` when typing dynamic values.
- **Interface Naming**: Avoid using the `I` prefix for interfaces. For example, use `ProductActiveFilters` instead of `IProductActiveFilters`.
- **Function Declarations**: Use traditional function declarations (`export function Component()`) for React UI components (preserving devtools names and HMR compatibility) and top-level helper functions. Arrow functions are preferred for inline event handlers and array callbacks.

### 2. Schema-Driven Design (SDD)
- All entity types (such as `TProduct`, `TUser`) must be inferred directly from the Drizzle database schema using Drizzle's helpers:
  ```typescript
  export type TProduct = typeof products.$inferSelect;
  export type TNewProduct = typeof products.$inferInsert;
  ```
- To prevent circular dependencies, any Service Interfaces that communicate with the database must be co-located with their Service Implementations in `packages/database`.

### 3. Fat Service Pattern & Constructor DI
- **Fat Service Pattern**: Execute CRUD and basic query logic directly within service files (e.g. `packages/database/src/services/product/product.service.ts`). Do not create boilerplate repository layers for simple queries. Put highly complex or analytical queries in dedicated query modules to avoid bloating services.
- **Manual Dependency Injection**: Every service class must receive its database connection instance via its constructor:
  ```typescript
  export class ProductService {
    constructor(private db: DatabaseConnection) {}
    // ...methods
  }
  ```
- **Database Transactions**: When executing logic inside a Drizzle transaction, instantiate a temporary service instance wrapping the transaction context (`tx`):
  ```typescript
  const txService = new ProductService(tx);
  ```
- **Singleton Registry**: Initialize all production singleton service instances (using the default database client) in `packages/database/src/services/registry.ts`.

### 4. Zod Schema Separation
- Do not mix database schemas and user input validation.
- All Zod validation schemas used for UI forms or Server Actions must be strictly separated from Drizzle database schemas. Place validation schemas in `packages/database/src/validators/` (e.g., `product.validators.ts`).

### 5. Test Co-location
- All unit and integration tests (using `bun:test`) must be co-located directly next to their implementation files. For instance, place `product.service.test.ts` in the same directory as `product.service.ts`. Do not place them in separate test directories.

### 6. Next-Intl Keys Localization
- Translation keys in `/messages/vi.json` and `/messages/en.json` must be flat (single-level key-value mappings).
- Avoid deep object nesting in localization JSON files (e.g., nesting title and descriptions inside a sub-object), as this breaks Next-Intl's strict compiler type checking and triggers build errors.

### 7. Next.js API Routes & Prerender Re-throw
- When catching errors in Next.js API Route handlers, you must inspect the error and re-throw `NEXT_PRERENDER_INTERRUPTED` or any error mentioning dynamic prerendering.
- Next.js throws these exceptions internally to indicate that it must opt out of static prerendering for that path. Catching and swallowing these exceptions will result in build or dynamic-rendering failures.
  ```typescript
  } catch (error) {
    const errObj = error as Record<string, unknown>;
    if (
      error instanceof Error &&
      (errObj["digest"] === "NEXT_PRERENDER_INTERRUPTED" ||
        error.message.includes("bail out of prerendering"))
    ) {
      throw error;
    }
    // Handle or log other application errors
  }
  ```

### 8. Admin Portal Layout Design
- When building form components inside `apps/admin/src/features/`, do not hardcode page titles (like `<h2>` or `<h3>`) inside the form files themselves.
- Instead, extract headings and pass the translated title and description fields to the shared `<Header>` layout component at the page level.

---

## Commit Messages

We follow the Conventional Commits specification:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `chore`: Auxiliary tool changes or build updates

Example commit messages:
```bash
feat: add products pagination support
fix: resolve cart count calculation mismatch
docs: update monorepo setup instructions
```

---

## Pull Request Process

1. Fork the repository and create a feature branch (`git checkout -b feature/your-feature`).
2. Make your modifications.
3. Validate your changes using local checks:
   - Run type checks: `bun run check-types`
   - Run linter checks: `bun run lint`
   - Run tests: `bun run test`
4. Commit your changes using Conventional Commits.
5. Push to your branch and open a Pull Request.

---

## Reporting Issues

Please use GitHub Issues to report bugs or request new features. Include:

- A clear and descriptive title
- Detailed step-by-step reproduction instructions
- The expected behavior vs the actual observed behavior
- Any relevant code snippets, logs, or error screenshots
- Local configuration information (Bun version, OS, etc.)

---

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
