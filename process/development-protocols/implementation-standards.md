# Implementation Standards

## Core Principles

- **YAGNI (You Aren't Gonna Need It) & KISS (Keep It Simple, Stupid)**: Do not write speculative code, unused prepared statements, or redundant interfaces. Keep code structures as simple as possible to satisfy the current requirements.
- **DRY (Don't Repeat Yourself)**: Ban copy-pasting CRUD logic and error mappings. Abstract shared database patterns (e.g., error helpers, recurrent queries) and utility functions into dedicated modules rather than repeating them across multiple services or actions.
- **Scout Rule**: Every edit MUST leave the touched files cleaner. When modifying any file, remove unused imports, clean or remove stale comments, delete dead code, and standardize minor syntax details.
- Read `process/context/all-context.md` first, then load only the relevant context group or root file.
- Prefer updating existing files over creating parallel "enhanced" variants.
- Implement real code paths rather than mock-only stand-ins unless the user explicitly asks for a mock or stub.

## Code Organization

- Use descriptive kebab-case filenames.
- Keep TypeScript and JavaScript source files roughly under 200 lines when practical; split by responsibility when files become hard to reason about.
- Prefer focused modules, helpers, and composition over large mixed-purpose files.
- **Top-Down Clean Code (Stepdown Rule)**: Structure source files so that they read top-down. Public/high-level API entrypoints, orchestrator functions, and primary exports must appear at the top of the file. Low-level implementation details, private helper functions, and local utility routines must appear below them, ordered progressively by their level of abstraction. A reader should be able to scan the file like a narrative, descending naturally from interface to detail.
- Markdown planning, context, agent, and skill files are exempt from the 200-line rule.

## Separation of Concerns (SoC)

### 1. Database Schema vs. UI Presentation Boundary

- **No Raw Schema Leakage**: Database ORM entities (e.g., Drizzle table schemas, raw `$inferSelect` or `$inferInsert` types) MUST NOT leak into the UI components or presentation layer.
- **Sanitized DTOs**: Server Actions and API endpoints must map and return sanitized Data Transfer Objects (DTOs) that only expose fields necessary for the UI. Sensitive or internal database columns (e.g., password hashes, internal status keys, deleted markers) must never cross this boundary.

### 2. Validators vs. UI Boundary

- **Pure Validators**: Zod validation schemas in the database package (e.g., `packages/database/src/validators/*`) must remain pure domain validation schemas.
- **No UI Coupling**: They must not contain UI-specific translation keys, translation functions (e.g., parameterized translators passed to schema factories), or UI package dependencies (e.g., no imports from `@nhatnang/ui` or client-side translation contexts).
- **Presentation-Layer Localization**: Localized error messaging and UI translation keys must live in the application UI/presentation layer, mapping validator errors to UI-friendly output at the form or page level.
- **Zod Skill Compliance**: Any work involving Zod schema definition, payload validation, or type inference MUST strictly comply with and utilize the rules defined in the Zod skill (`vc-zod`).

### 3. Database Schemas vs. UI Filter Options

- **Independent Layout Elements**: Component filters, select dropdown options, and UI search layouts must not be coupled directly to database table schemas or database-internal enums.
- **Separate Option Mapping**: Maintain distinct presentation-layer definitions for filters and map them to database queries explicitly in the application layer.

## SOLID Principles

### 1. Dependency Inversion Principle (DIP)

- **Constructor Injection**: Services must receive database connections (e.g., database clients or transactions conforming to `IDatabase`) via constructor injection rather than importing a global database client singleton directly.
- **Robust Mocking & Test Isolation**: Tests must mock at the service interface level or run against isolated, in-memory databases. Tests MUST NOT mock internal Drizzle query builder calls or chain sequences (e.g., mocking `.select().from().where()`), preventing high coupling between test logic and database library implementation details.

### 2. Interface Segregation Principle (ISP)

- **Standardized, Scoped Interfaces**: Define standardized service interfaces (e.g., `IWarehouseStockService`, `IWarehouseService`) that expose only the methods required by their clients. Avoid monolithic interfaces that bundle unrelated capabilities.

### 3. Single Responsibility Principle (SRP)

- **Focused Service Scope**: Services must have one reason to change, focusing entirely on domain/business logic.
- **No Global Auth Calls**: Services must not directly call global auth APIs (e.g., Next Auth's `getServerSession`, session getters) or handle user authentication context resolution internally.
- **Authorization Separation**: Session verification and access control must be handled in the routing, middleware, or Server Action layer. The resolved user identity context should be passed explicitly as a parameter to the service methods.
- **No Mixed Concerns**: Avoid combining business rules, UI formatting, and auditing logic in a single service function.

## KISS & YAGNI Enforcement

- **Prune Unused Code**: Actively delete unused prepared statements, unused types, or redundant interfaces.
- **No Pre-Optimization**: Do not build generic layers, wrappers, or abstract factories until there is a concrete, duplicate use-case requiring them.
- **Dead Code Clean Up**: If code is commented out or no longer has references in the workspace, delete it immediately.

## Implementation Behavior

- Follow established architecture and local code patterns before inventing new ones.
- In utility or helper layers, prefer result objects over throwing when the local repo pattern expects recoverable errors.
- Handle edge cases and error paths deliberately.
- Prioritize readable, maintainable code over clever abstractions.

## Tooling

- Use `bun`, not `npm`.
- Use Context7 for library and API docs or setup guidance.
- Use `gh` for GitHub automation when needed.
- For database debugging, follow the current repo stack and context docs; do not assume Drizzle or SQLite unless the specific package actually uses them.

## Quality Gates

- Ensure code is syntactically valid and compiles where applicable.
- Run the most relevant tests for the change before calling work complete.
- Use code review or reviewer agents for meaningful implementation changes.
- Do not wave away failing tests just to force a green status.

## Risky Work Evidence Contract

For high-risk work, use a manual-first evidence pack before calling the change ready for finalize, push, or human handoff.

High-risk classes include:

- auth or identity flows
- billing, payments, or credit accounting
- schema/data migrations or destructive writes
- public API or external contract changes
- deploy/runtime/container/proxy/gateway behavior
- permission, secret, or trust-boundary logic

Preferred artifact set in the selected plan's reports `harness/` folder:

- `risk-gate.json`
- `context-snippets.json`
- `verification.json`
- `review-decision.json`
- `adversarial-validation.json` for high-risk or adversarial paths

Auto-stop rule:

- if risk is `high`, do not treat the work as ready to finalize until the evidence pack exists and the reviewer decision is recorded
- if the evidence pack is missing, say so explicitly instead of implying the work is proven

This contract is manual-first and opt-in by risk class. It is not a default blocking hook.

## Commit Hygiene

- Keep commits focused on the requested change.
- Never commit secrets or credentials.
- Use clean professional commit messages, ideally conventional-commit style when it fits the change.
