# AGENTS.md

## Critical Directive: Always Initialize & Follow Todo

- **Mandatory Todo Initialization**: For any non-trivial or multi-step task, you MUST immediately initialize a phased todo list using the `todo` tool.
- **Strict Comply & Transition**: Follow the todo list item-by-item. Mark tasks as completed (`done`) immediately after completing them, and transition to the next task in the same turn.

---

## AI-Human Collaboration Protocol

- **Boilerplate Scaffolding**: AI scaffolds boilerplate code only (UI component shells, Server Action wrappers, DTO type mappings, test harness).
- **Core Business Logic**: AI MUST NEVER write pricing calculations, margin adjustments, custom discount calculations, or payment processing algorithms directly.
- **Structured TODO Guiding**: For all core logic, AI provides structured step-by-step `// TODO:` guidance and architectural review; human writes the implementation directly.

---

## Engineering Standards

MUST read the corresponding standard file under `docs/standards/` before modifying related code or tests:

- **Issue tracking & tickets** → `docs/standards/issue-tracker.md`
- **Architecture & design principles (DRY, YAGNI, AHA, Deep Modules)** → `docs/standards/code-architecture-and-design-principles.md`
- **Comments & docstrings** → `docs/standards/code-comment-taxonomy.md`
- **Tests, factories, and fixtures** → `docs/standards/testing-and-fixtures.md`
- **Auth, tokens, and sanitization** → `docs/standards/security-and-cryptography.md`
- **Branches, commits, and PRs** → `docs/standards/git-flow-and-pr-matrix.md`

---

## Tech Stack & Commands

- **Framework & Runtime:** Next.js 16 (App Router, Server Actions, RSC, `"use cache"`) + Bun v1.4+
- **Styling & UI:** Tailwind CSS v4 + Radix UI / shadcn/ui
- **API Client:** `openapi-fetch` (`api.METHOD`) with compile-time DTOs in `src/types/api.ts`
- **Internationalization:** `next-intl` (dynamic locale `[locale]`)
- **Environment Secrets:** Doppler CLI (`doppler run -- next dev -p 3002`)
- **Development Server:** `bun run dev` (Port 3002)
- **Type Sync:** `bun run types:pull`
- **Type Check:** `bun run check-types` (`tsc --noEmit`)
- **Linting & Formatting:** `bun run lint` & `bun run format`

---

## Project Structure

- `app/[locale]/` — Next.js App Router (Layouts, Pages, Server Actions)
- `messages/` — Translation dictionaries (`vi.json`, `en.json`)
- `src/features/` — Feature modules (products, quotes, orders, stock, customers)
- `src/lib/` — API client instance (`api`) and utility functions
- `src/types/` — DTO interfaces (`api.ts`) and raw schema definitions (`api-schema.d.ts`)
- `src/shared/` — Reusable UI components, hooks, Cloudinary services
- `docs/standards/` — Operational engineering standards for frontend

---

## Working Guidelines & Skill Workflows

1. **User Control First:** Never run unverified bulk code changes. Always present choices and clarify intent.
2. **Server-First Boundary:** Keep all mutations and API calls inside Server Actions or Server Components; never expose credentials to client bundles.
3. **Engineered Skill Workflows:**
   - **Requirement Alignment:** Use `/grill-with-docs` (or `/grill-me`) to clarify feature scope.
   - **Specification & Tickets:** Use `/to-spec` to lock specs and `/to-tickets` to split into tracer-bullet tickets.
   - **Feature Implementation:** Use `/implement` + `/tdd` to write features test-first.
   - **Bug Diagnosis:** Use `/diagnosing-bugs` for disciplined 5-phase bug root-cause analysis.
   - **Code Review:** Use `/code-review` before committing to verify spec compliance and code standards.
