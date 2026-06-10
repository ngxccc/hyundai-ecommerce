# 6. Monorepo Workspace Architecture with Turborepo

Date: 2026-06-04

## Status

Accepted

## Context

As the platform expanded to include multiple independent web clients and services (e.g., the `admin` portal, the e-commerce `storefront`, and the technical `docs` portal), we faced challenges maintaining structural cohesion. Storing these applications in separate repositories would lead to duplicated database client setups, UI component fragmentation, and complex package versioning.

We needed a structure that allowed us to:

1. Maintain UI consistency across storefront and admin applications.
2. Share database schemas, migrations, and service layers natively.
3. Keep configurations (ESLint, TypeScript) centralized and uniform.
4. Scale build, test, and lint execution times.

## Decision

We will **use a Monorepo workspace architecture** managed by **Turborepo** with package/app linking handled by **Bun/npm workspaces**.

Our directory structure is organized into:

- `/apps`: Contains deployable web applications (`admin`, `storefront`, `docs`).
- `/packages`: Contains shared internal packages (`database`, `ui`, `shared`, `types`, `eslint-config`, `typescript-config`).

## Consequences

- **Positive (Code Sharing & Reuse)**: Common features (e.g., Drizzle DB DTOs, ESLint rules, and UI components like `ScrollToTop`) can be extracted to shared packages (`@nhatnang/database`, `@nhatnang/ui`) and imported into applications without copying files.
- **Positive (Parallelization & Caching)**: Turborepo automatically builds a task dependency graph. Commands like `lint`, `build`, `test`, and `check-types` are executed in parallel across all workspaces. Task results are cached locally, ensuring unchanged modules are never rebuilt.
- **Positive (Strict Boundary Enforcements)**: Packages define strict entrypoints (via `exports` in `package.json`), which prevents apps from reaching into private files or violating architectural layering.
- **Negative (Monorepo Complexity)**: Workspaces require a root-level lockfile and build configuration, which can lead to package dependency version drift if not monitored (managed via `syncpack`).
- **Negative (Tooling Configurations)**: IDEs (like VSCode) require proper workspace-aware settings to resolve path aliases across packages correctly.

### Explicit Tradeoffs

- **Code Reuse & Speed vs. Setup Complexity**: We trade independent, simple single-project repositories for shared monorepo packages (`@nhatnang/ui`, `@nhatnang/database`) and parallel Turborepo execution, which speeds up CI/CD but increases initial workspace configuration overhead.
- **Strict Module Boundaries vs. Dependency Coordination**: We trade flexible direct file references across applications for strict package entrypoints, preventing architectural layer violations but requiring manual dependency tracking and syncpack management.
