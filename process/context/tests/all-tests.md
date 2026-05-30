# Testing Quick-Start & Guidelines

## Scope & Purpose

This document serves as the authoritative source for testing conventions in this repository. All code must pass these quality gates before considered complete.

## Available Test Runners

- **Unit/Integration Testing**: We use `bun test` for testing backend services and logic, as it runs exceptionally fast and has built-in Jest-like syntax.
- **Linting**: Run `bun run lint` (using ESLint) to catch stylistic issues and basic JS errors.
- **Strict TypeScript Checking**: Use `bunx tsc -p tsconfig.json --noEmit` to verify structural typing.

## The Testing Protocol

When validating your implementation, follow these strict phases:

1. **Run Unit Tests**: `bun run test src/` (ensure business logic passes).
2. **Run Linter**: `bun run lint` (ensure style passes).
3. **Run Strict TypeScript Check (CRITICAL)**: `bunx tsc -p tsconfig.json --noEmit` (to catch structural type issues that `bun test` or `eslint` may silently miss).
   - _Why?_ Fast test runners often bypass deep type checking. VSCode will flag structural typing errors that `bun test` ignores. Running `tsc --noEmit` guarantees the codebase is 100% type-safe.

## Mocking Best Practices

- Never use `as any` or cast partially incomplete objects using `as Type`.
- Provide **full mock objects** representing the exact Type structure expected by TypeScript.
- Use built-in type guards (e.g., `isUniqueConstraintError`) to ensure tests and production code cleanly handle expected failure branches.
- **Drizzle DB Mocking (`db-mock.ts`)**: When testing Services with `mockDb`, DO NOT use `vi.resetAllMocks()` in your `beforeEach()` hook, as this will destroy the chained implementations (`where`, `limit`, `values`) established in `db-mock.ts`. Use `vi.clearAllMocks()` instead. If your service uses a new Drizzle chain method (like `.limit()`), you must first add it to the mock chain in `packages/database/src/tests/utils/db-mock.ts`.
