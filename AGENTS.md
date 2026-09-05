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

## Engineering Standards (Localized per Package)

Each package maintains its own localized operational standards. You MUST read and comply with the corresponding standard under `<package>/docs/standards/` when working within that package:

### Backend Standards (`backend/docs/standards/`)

- **Database & Migrations** → `backend/docs/standards/database-and-migrations.md`
- **Concurrency & Locking** → `backend/docs/standards/concurrency-and-locking.md`
- **API Design & Error Handling** → `backend/docs/standards/api-design-and-error-handling.md`
- **Benchmarks & Performance** → `backend/docs/standards/benchmarking-and-performance-testing.md`
- **Testing & Fixtures** → `backend/docs/standards/testing-and-fixtures.md`
- **Security & Cryptography** → `backend/docs/standards/security-and-cryptography.md`
- **Architecture & Deep Modules** → `backend/docs/standards/code-architecture-and-design-principles.md`
- **Domain Glossary & ADRs** → `backend/docs/standards/domain-docs.md`
- **Git Flow & PR Matrix** → `backend/docs/standards/git-flow-and-pr-matrix.md`
- **Comment Taxonomy** → `backend/docs/standards/code-comment-taxonomy.md`
- **Issue Tracking & Tickets** → `backend/docs/standards/issue-tracker.md`

### Frontend Standards (`admin/docs/standards/` & `storefront/docs/standards/`)

- **Architecture & Components** → `<app>/docs/standards/code-architecture-and-design-principles.md`
- **Testing & Test Harness** → `<app>/docs/standards/testing-and-fixtures.md`
- **Security & Token Handling** → `<app>/docs/standards/security-and-cryptography.md`
- **Git Flow & PR Matrix** → `<app>/docs/standards/git-flow-and-pr-matrix.md`
- **Comment Taxonomy** → `<app>/docs/standards/code-comment-taxonomy.md`
- **Issue Tracking & Tickets** → `<app>/docs/standards/issue-tracker.md`

---

## Tech Stack & Commands

- **Architecture:** Decoupled Standalone Multi-Application Architecture (Polyrepo-Ready)
- **Runtime:** Bun v1.4+
- **Backend Service:** NestJS 11 + Drizzle ORM + PostgreSQL 18 + Redis 8 (`backend/`)
- **Admin Portal:** Next.js 16 (App Router, Server Actions, `openapi-fetch`) on Port 3002 (`admin/`)
- **Customer Storefront:** Next.js 16 (App Router, Server Actions, `openapi-fetch`) on Port 3001 (`storefront/`)
- **Development Commands:**
  - Backend: `bun run dev:backend`
  - Storefront: `bun run dev:storefront`
  - Admin: `bun run dev:admin`
- **Quality & Verification:**
  - Type Check: `bun run check-types`
  - Linting: `bun run lint`
  - Testing: `bun run test` (or `bun run test:backend`)
- **API Contract Sync:** `bun run types:sync` (root) or `bun run types:pull` (in `admin/` & `storefront/`)

---

## Project Structure

- `backend/` — Standalone NestJS 11 REST API Server (`src/modules/`, `src/database/`, `test/`)
- `admin/` — Standalone Next.js 16 Backoffice Admin Dashboard (`app/`, `src/features/`, `messages/`)
- `storefront/` — Standalone Next.js 16 Customer Storefront & B2B RFQ Portal (`app/`, `src/features/`, `messages/`)
- `docker-compose.yml` — Local PostgreSQL 18 & Redis 8 infrastructure
- `.github/workflows/` — Monorepo CI/CD orchestrators with path filtering

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
