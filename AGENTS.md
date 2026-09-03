# AGENTS.md

## Critical Directive: Always Initialize & Follow Todo

- **Mandatory Todo Initialization**: For any non-trivial or multi-step task, you MUST immediately initialize a phased todo list using the `todo` tool.
- **Strict Comply & Transition**: Follow the todo list item-by-item. Mark tasks as completed (`done`) immediately after completing them, and transition to the next task in the same turn.

---

## AI-Human Collaboration Protocol

- **Boilerplate Scaffolding**: AI scaffolds boilerplate code only (DTO schemas, database schemas/services, route handlers, server actions, test harness).
- **Core Business Logic**: AI MUST NEVER write core business logic, domain calculations, pricing/discount logic, database transactions, or algorithm implementations directly.
- **Structured TODO Guiding**: For all core logic, AI provides structured step-by-step `// TODO:` guidance and architectural review; human writes the implementation directly.

---

## Engineering Standards

MUST read the corresponding standard file under `docs/standards/` before modifying related code or tests:

- **Issue tracking & tickets** → `docs/standards/issue-tracker.md`
- **Domain glossary & ADRs** → `docs/standards/domain-docs.md`
- **Architecture & design principles (DRY, YAGNI, AHA, Deep Modules)** → `docs/standards/code-architecture-and-design-principles.md`
- **Comments & docstrings** → `docs/standards/code-comment-taxonomy.md`
- **Routes, DTOs, and error responses** → `docs/standards/api-design-and-error-handling.md`
- **Schemas, queries, and migrations** → `docs/standards/database-and-migrations.md`
- **Locks, race conditions, and transactions** → `docs/standards/concurrency-and-locking.md`
- **Tests, factories, and fixtures** → `docs/standards/testing-and-fixtures.md`
- **Benchmarks & performance** → `docs/standards/benchmarking-and-performance-testing.md`
- **Auth, hashing, and sanitization** → `docs/standards/security-and-cryptography.md`
- **Branches, commits, and PRs** → `docs/standards/git-flow-and-pr-matrix.md`
- **Formal specifications** → `docs/formal-specs/`

---

## Tech Stack & Commands

- **Monorepo Engine & Runtime:** Turborepo + Bun v1.3+ Workspaces
- **Frontend Applications:** Next.js 16 (App Router, React Server Components, Server Actions, Route Handlers, `"use cache"`)
- **Database & ORM:** PostgreSQL + Drizzle ORM (`packages/database`)
- **Service Architecture:** Direct Pure Service Singletons with Constructor Dependency Injection (ADR 0002 & ADR 0013)
- **Cache & Concurrency:** Redis (IoRedis, Redlock, Rate Limiter)
- **Payment & Media Integrations:** PayOS (OpenAPI webhook & checkout), Cloudinary SDK
- **Environment Secrets:** Doppler CLI (`doppler run -- turbo run ...`)
- **Development:** `bun run dev` (or `bun run dev:storefront`)
- **Testing:** `bun run test` (or `bun test packages/database/`, `bun test apps/storefront/`)
- **Type Check:** `bun run check-types` (`turbo run check-types`)
- **Linting & Formatting:** `bun run lint` & `bun run format:pkg`

---

## Project Structure

- `apps/storefront/` — Next.js 16 Customer Storefront (`app/[locale]/(shop)`, `(portal)`, API Route Handlers, Cron jobs)
- `apps/admin/` — Next.js 16 Backoffice Admin Portal (Quản lý sản phẩm, danh mục, thương hiệu, kho, đơn hàng, báo giá B2B)
- `packages/database/` — Drizzle ORM schemas, migrations, DTOs, validators, and pure service singletons (`src/services/`)
- `packages/shared/` — Shared constants, utilities, PayOS client, and rate limiters
- `packages/ui/` — Shared React UI components (Tailwind CSS, Radix UI)
- `packages/eslint-config/` & `packages/typescript-config/` — Monorepo configs
- `docs/standards/` — Engineering operational standards
- `docs/adr/` — Architectural Decision Records

---

## Working Guidelines & Skill Workflows

1. **User Control First:** Never run unverified bulk code changes. Always present choices and clarify intent.
2. **Domain Terms:** Read `CONTEXT.md` (if present) for project-specific domain terms and ADRs.
3. **Engineered Skill Workflows:**
   - **Requirement Alignment:** Use `/grill-with-docs` (or `/grill-me`) to clarify feature scope and update ADRs/glossary.
   - **Specification & Tickets:** Use `/to-spec` to lock specs and `/to-tickets` to split into tracer-bullet tickets.
   - **Feature Implementation:** Use `/implement` + `/tdd` to write features test-first.
   - **Bug Diagnosis:** Use `/diagnosing-bugs` for disciplined 5-phase bug root-cause analysis.
   - **Code Review:** Use `/code-review` before committing to verify spec compliance and code standards.
   - **Architecture Maintenance:** Use `/improve-codebase-architecture` periodically to deepen module design.

---

## Stack Overflow for Agents (SOFA) Integration

This repository is configured with **Stack Overflow for Agents (SOFA)** for knowledge exchange, playbook discovery, and verified problem solving.

- **Credentials Storage**: `.sofa/credentials.json` (gitignored, mode `0600`).
- **Base Endpoint**: `https://agents.stackoverflow.com`
- **Authentication**: Send `Authorization: Bearer <API_KEY>` loaded from `.sofa/credentials.json`.
- **Session Lifecycle**: Create a runtime session with `POST /api/sessions` (`X-Sofa-Client-Name`, `X-Sofa-Model-Name`), then send `X-Sofa-Session: <session_id>` on subsequent API calls.
- **Usage Triggers**: Consult SOFA for high-uncertainty debugging, distributed lock/concurrency edge cases, or pulling verified playbooks with high trust scores (`trust_summary.score >= 60`).
- **Reference Specification**: `https://agents.stackoverflow.com/skill.md`.
