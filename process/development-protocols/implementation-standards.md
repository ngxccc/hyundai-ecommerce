# Implementation Standards

## Core Principles

- Follow YAGNI, KISS, and DRY.
- Read `process/context/all-context.md` first, then load only the relevant context group or root file.
- Prefer updating existing files over creating parallel "enhanced" variants.
- Implement real code paths rather than mock-only stand-ins unless the user explicitly asks for a mock or stub.

## Code Organization

- Use descriptive kebab-case filenames.
- Keep TypeScript and JavaScript source files roughly under 200 lines when practical; split by responsibility when files become hard to reason about.
- Prefer focused modules, helpers, and composition over large mixed-purpose files.
- Markdown planning, context, agent, and skill files are exempt from the 200-line rule.

## Implementation Behavior

- Follow established architecture and local code patterns before inventing new ones.
- In utility or helper layers, prefer result objects over throwing when the local repo pattern expects recoverable errors.
- Handle edge cases and error paths deliberately.
- Prioritize readable, maintainable code over clever abstractions.

## Function & React Component Standards

### 1. Traditional Functions (`function` / `export function`)

Use traditional function declarations for:

- **React UI Components:** Prefer `export function` or `export default function` over arrow functions.
  - **Component Identity & DevTools:** Traditional functions preserve the `name` property automatically, preventing `Anonymous` displays in React DevTools.
  - **Fast Refresh (HMR):** Named functions ensure Fast Refresh works reliably by using lexically bound names to keep state during updates.
  - **Generic TSX Syntax:** Avoid syntax workarounds for TSX generics (e.g. `<T,>`) by using the natural generic syntax of traditional functions: `function Select<T>(props: Props<T>)`.
  - **Next.js Server Components:** Write async Server Components cleanly using `export default async function Component()`.
  - **Hoisting / Top-Down Structure:** Place the main exported component at the top of the file, and supplementary sub-components below it. Traditional functions support hoisting, allowing sub-components to be declared at the bottom of the file.
- **Top-Level Helper/Utility Functions:** Declaring standard helpers with `export function formatCurrency()` provides cleaner stack traces in error tracking tools and supports hoisting.
- **Service/Class Methods:** Use standard method declarations inside service classes (e.g., in `packages/database/src/services/`) for standard constructor/context binding.

### 2. Arrow Functions (`const foo = () => {}`)

Use arrow functions for:

- **Callbacks & Array Methods:** Inline callbacks inside array operations (e.g., `.map()`, `.filter()`, `.find()`, `.reduce()`).
- **Inline Event Handlers:** Inline handlers in JSX (e.g., `onClick={() => handleSelect(id)}`).
- **Closures & High-Order Functions:** Inner functions inside component rendering cycles or functional pipelines where lexical context (`this` binding) or concise one-liner syntax is beneficial.

## Database Indexing Standards

- Do not blindly index every column in a `WHERE`, `JOIN`, or `ORDER BY` clause. Consider selectivity, cardinality, and write overhead.
  - **Foreign Keys:** Always index foreign keys (e.g., `userId` in `orders`, `orderId` in `orderItems`, `productId` in `warehouseStocks`) as PostgreSQL does not index them automatically and they are heavily used in joins.
  - **High Cardinality (UUID, Email, Phone, Slug, CreatedAt):** Index these columns if they are frequently queried, sorted, or range-scanned.
  - **Low Cardinality (Boolean, Status, Role, Gender):** Avoid standard indexes as they lead to Full Table Scans since selectivity is low.
  - **Partial & Composite Indexes:**
    - Use partial indexes (e.g., `where status = 'pending'`) for rare, hot states instead of indexing the entire column.
    - Use composite indexes (e.g., `(userId, status)` or `(userId, createdAt DESC)`) when queries filter by multiple fields or sort the results.
  - **Expression Indexes:** For filtering JSONB fields (e.g., specs), use expression indexes casting to numeric or relevant types to avoid parsing JSON at query runtime.

## Tooling

- Use `pnpm`, not `npm`.
- Use Context7 for library and API docs or setup guidance.
- Use `gh` for GitHub automation when needed.
- For database debugging, follow the current repo stack and context docs; do not assume Drizzle or SQLite unless the specific package actually uses them.
- Markdown formatting: Always format markdown files using Prettier.

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
