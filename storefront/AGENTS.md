# AGENTS.md

## Critical Directive: Always Initialize & Follow Todo

- **Mandatory Todo Initialization**: For any non-trivial or multi-step task, you MUST immediately initialize a phased todo list using the `todo` tool.
- **Strict Comply & Transition**: Follow the todo list item-by-item. Mark tasks as completed (`done`) immediately after completing them, and transition to the next task in the same turn.

---

## AI-Human Collaboration Protocol

- **Boilerplate Scaffolding**: AI scaffolds boilerplate code only (UI component shells, Server Action wrappers, DTO type mappings, test harness).
- **Core Business Logic**: AI MUST NEVER write cart pricing calculations, tax rates, volume discount logic, or payment processing algorithms directly.
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
- **API Client:** `openapi-fetch` (`api.METHOD`) with compile-time schema definitions in `src/types/api-schema.d.ts`
- **Internationalization:** `next-intl` (dynamic locale `[locale]`)
- **Environment Secrets:** Doppler CLI (`doppler run -- next dev -p 3001`)
- **Development Server:** `bun run dev` (Port 3001)
- **Type Sync:** `bun run types:pull`
- **Type Check:** `bun run check-types` (`tsc --noEmit`)
- **Linting & Formatting:** `bun run lint` & `bun run format`

---

## Project Structure

- `app/[locale]/` — Next.js App Router (Layouts, Pages, Server Actions)
  - `(shop)/` — Catalog browsing, product detail, cart & checkout
  - `(portal)/` — Customer order tracking and quote inquiry portal
- `messages/` — Translation dictionaries (`vi.json`, `en.json`)
- `src/features/` — Feature modules (catalog, cart, quotes, orders, customer)
- `src/lib/` — API client instance (`api`) and utility functions
- `src/types/` — Raw schema definitions (`api-schema.d.ts`)
- `src/shared/` — Reusable UI components, hooks, utilities
- `docs/standards/` — Operational engineering standards for frontend

---

## Working Guidelines & Skill Workflows

1. **User Control First:** Never run unverified bulk code changes. Always present choices and clarify intent.
2. **SEO & Accessibility First:** Ensure all customer-facing routes maintain semantic HTML, accessible ARIA attributes, and dynamic metadata with JSON-LD structured data.
3. **Engineered Skill Workflows:**
   - **Requirement Alignment:** Use `/grill-with-docs` (or `/grill-me`) to clarify feature scope.
   - **Specification & Tickets:** Use `/to-spec` to lock specs and `/to-tickets` to split into tracer-bullet tickets.
   - **Feature Implementation:** Use `/implement` + `/tdd` to write features test-first.
   - **Bug Diagnosis:** Use `/diagnosing-bugs` for disciplined 5-phase bug root-cause analysis.
   - **Code Review:** Use `/code-review` before committing to verify spec compliance and code standards.
