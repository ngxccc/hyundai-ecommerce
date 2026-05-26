# AGENTS.md - Hyundai Ecommerce Project

## Project Overview

- **Type**: B2B E-commerce platform for industrial equipment (Hyundai, Mitsubishi, Kubota generators)
- **Architecture**: Turborepo monorepo with Next.js 16 App Router
- **Main Apps**:
  - `apps/storefront` — Customer-facing B2B website
  - `apps/docs` — Technical documentation (Fumadocs)
- **Shared Packages**:
  - `packages/database` — Drizzle ORM + Better Auth schemas
  - `packages/types`, `packages/typescript-config`, `packages/eslint-config`

## Agent Skills

### Issue tracker

GitHub Issues are the source of truth for this repo. See [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

### Triage labels

Use the canonical triage labels with no repo-specific overrides. See [docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain docs

This repo uses a single source of truth in the root `CONTEXT.md`. See [docs/agents/domain.md](docs/agents/domain.md).

## Skill Activation Rules (MUST FOLLOW)

Use the following skills in this exact order for any new feature or major change:

1. **grill-me** or **grill-with-docs** (mandatory first step)
   - Always start with `/grill-me` for simple tasks
   - Use `/grill-with-docs` when the task touches domain model, auth, or shared packages
   - Goal: Reach shared understanding before writing any code

2. **to-prd** or **to-issues**
   - Convert the grilled plan into a clear PRD or GitHub issues using vertical slices

3. **improve-codebase-architecture**
   - Run this before implementing if the change touches multiple modules
   - Especially important for auth, database, and monorepo structure

4. **tdd**
   - Always use with `bun:test` runner
   - Write failing test first → implement → refactor
   - Never skip this step

5. **Other skills** (use when relevant):
   - `web-forms-react-hook-form` + `web-forms-zod-validation` → for any form work
   - `web-ui-shadcn-ui` → when creating new UI components
   - `web-i18n-next-intl` → when adding new text/translations
   - `diagnose` → when debugging complex issues
   - `prototype` → for throwaway experiments
   - `zoom-out` → when you feel lost in the codebase
   - `caveman` → when you want ultra-concise responses

**Never** use skills from `agents-inc/skills` unless the task specifically requires infrastructure, CI/CD, or security hardening.

**Default behavior:** If unsure which skill to use, always start with `/grill-me`.

## Core Principles

### Server vs Client Boundaries ("use client" / "use server")

**Rules for `"use client"` (UI Boundary):**

- **Push State Down (Leave the Leaves):** Never put `"use client"` at the root of a feature, page, or layout. Push it down to the smallest possible leaf component (e.g., `Button`, `Modal`, `SearchInput`).
- **Composition (Interleaving):** If a Client Component must wrap other elements (e.g., a Sidebar or a Context Provider), it MUST accept them via the `children` prop. Client components must NEVER directly import Server Components.

**Rules for `"use server"` (Network Boundary):**

- **NEVER use to declare Server Components:** Server Components are the default. Putting `"use server"` at the top of a Server Component is a critical anti-pattern and security risk (it creates public endpoints for every exported function).
- **Strictly for Server Actions:** Only use `"use server"` inside async functions or at the top of dedicated action files (e.g., `actions.ts`) to mark mutations or data-fetching functions called from the client.
- **Colocation:** Keep Server Actions isolated in `actions/` or `services/` rather than mixed with component UI code.

### File & Folder Structure

- Use **feature-based** structure: `src/features/[feature]/`
- Place components in `components/`
- Keep `page.tsx` as a thin Server Component (only layout + metadata)
- Move business logic into `actions/`, `services/`, or `stores/`

### Component Export Style

**Rules:**

- `page.tsx` and `layout.tsx` files use default export:

  ```tsx
  const RegisterPage = () => {
    return <div>...</div>;
  };
  export default RegisterPage;
  ```

- All other components use named exports:

  ```tsx
  export const RegisterForm = () => {
    return <form>...</form>;
  };
  ```

- Never use `export default` for child/reusable components
- Always split components — keep files under ~150-200 lines

### TypeScript Best Practices

#### Type vs Interface

- Prefer `interface` for object shapes, props, and API responses
- Only use `type` for unions, intersections, or mapped types

#### Naming Conventions

- Interfaces: `IPascalCase` (e.g., `IUser`, `IProduct`)
- Types: `TPascalCase` (e.g., `TUserRole`, `TBusinessType`)
- Props: `ComponentNameProps` (e.g., `RegisterFormProps`)

#### Function & Component Typing

Use clear, explicit typing:

```tsx
export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const handleSubmit = async (data: RegisterFormData) => { ... };
  return <form onSubmit={handleSubmit}>...</form>;
};

const ProductDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return <div>...</div>;
};
export default ProductDetailPage;
```

#### Strict Type Safety

- Avoid `any` unless absolutely necessary (add comment explaining why)
- Use `unknown` instead of `any` when type is unknown
- Always validate user/API input with **Zod**
- Use `satisfies` for tight type inference
- **Server Actions Return Types**: Always explicitly type return unions from Server Actions (e.g., success vs error branches). Do not rely on implicit union inference.
- **Handling Unions**: Always narrow union types properly before accessing properties to avoid `@typescript-eslint/no-unsafe-member-access` or `@typescript-eslint/no-unsafe-assignment` errors. Use type guards (e.g., `if (!res.success) throw new Error()`) or explicit type casting (e.g., `as TMyActionResult`) when testing.

#### Import/Export & Barrel Files (CRITICAL)

- Use named exports for child components and utilities
- Only use `export default` for `page.tsx` and `layout.tsx`
- **No strict feature-level barrel files**: Do NOT force a single `index.ts` file at the root of a feature to export everything.
- **Sub-barrel Categorization**: Use and allow sub-barrels for categorizing imports (e.g., `import { useNav } from "@/features/foo/hooks"`, or `.../components`, `.../services`).
- **Server/Client Boundary Safety**: Never mix Server and Client components in the same barrel file. For UI components, deep imports are allowed and encouraged to prevent bundle bloat and client-directive leaks (e.g., `import { ClientNav } from "@/features/dashboard/components/client-nav"`).
- Import order: External → Internal → Relative
- Group imports with comments when needed

#### React Hook Form Best Practices (Performance)

**Always prefer `useWatch` over `watch` or `Controller`**:

- `form.watch()` causes full component re-renders
- `useWatch` only re-renders the components that actually use the field

Example:

```tsx
import { useWatch } from "react-hook-form";

export const BusinessInfoSection = ({ form }: BusinessInfoSectionProps) => {
  const businessType = useWatch({
    control: form.control,
    name: "businessType",
  });

  const isB2B = ["dealer", "contractor", "distributor"].includes(businessType);

  return (
    <div>
      {isB2B && <CompanyFields />}
      <Controller
        name="businessType"
        control={form.control}
        render={({ field }) => <Select {...field} />}
      />
    </div>
  );
};
```

### Styling & UI

- Use **shadcn/ui** components from `@/shared/components/ui`
- Tailwind CSS v4 + custom design system
- Follow existing patterns in `src/features/home/components/`

#### Mobile-First Styling

- **CRITICAL RULE**: Always design and code UI components using a mobile-first approach.
- Write default CSS classes for mobile screens first (e.g., `w-full p-4 flex-col`).
- Use Tailwind's responsive modifiers (`md:`, `lg:`, `xl:`) strictly for larger screens (e.g., `md:flex-row md:w-1/2`).
- Agents MUST visualize and ensure the layout works perfectly on mobile devices before expanding it for desktop.

### Monorepo Rules (Turborepo)

- Never import directly from `apps/` into `packages/`
- Use workspace protocol: `"@nhatnang/database": "workspace:*"`
- Run commands with `bun --filter=storefront run dev`

### Authentication (Better Auth)

- Always use `authClient` from `@/shared/lib/auth-client`
- Never manually hash passwords — Better Auth handles it
- Registration flow must collect: `fullName`, `email`, `phone`, `companyName`, `taxId`, `businessType`, `province`
- **Session Management Rule**: Do NOT use Zustand or other client global state managers for session state. Always use `auth.api.getSession()` in Server Components and `authClient.useSession()` in Client Components.

### Database (Drizzle)

- All queries go through `packages/database`
- Use transactions (`withTransaction`) for multi-table operations
- Never write raw SQL unless absolutely necessary

### Internationalization & Hardcoded Text (STRICT RULE)

**Zero tolerance for hardcoded text.**

Every single piece of user-facing text **MUST** come from the i18n system:

- Frontend (Next.js): All text must live in `messages/en.json` and `messages/vi.json`
- Use `next-intl` (`useTranslations`, `getTranslations`, `useFormatter`)
- Backend / Packages / Shared code: Use dedicated constant files (`messages.ts`, `errors.ts`, `constants.ts`)

**Examples of what is FORBIDDEN:**

- Hardcoded strings in JSX: `<h1>Welcome</h1>`, `placeholder="Enter email"`, `toast("Login successful")`
- Hardcoded error messages: `catch (e) { return "Something went wrong" }`
- Hardcoded aria-label, title, alt text
- Hardcoded button text, tooltip, notification

**Correct pattern:**

```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('Auth');

<button>{t('login.button')}</button>
<Toast title={t('login.success')} />
```

**If you ever feel the urge to hardcode text → STOP.**
Create the key in `messages/` first, then use it.

This rule applies to **every** file: components, actions, services, error boundaries, and even console logs that users might see.

#### English for Development & System

While user-facing text uses i18n, **all system messages, developer-facing text, and code comments MUST be in English.**

- ESLint rule messages, build warnings, and console errors meant for developers must be in English.
- Code comments, docstrings, PRD descriptions, and inline documentation must be in English.
- System logs (`console.log`, `console.error` not seen by end-users) must be in English.

### Commands

- `bun run dev` — Start all apps
- `bun --filter=storefront run dev` — Start only storefront
- `bun run build` — Build everything
- `bun run db:generate` — Generate Drizzle migrations
- `bun run lint` — Run ESLint

### What NOT to Do

- Do NOT create new API routes under `app/api` unless necessary (prefer Server Actions)
- Do NOT use `any` type
- Do NOT put business logic inside `page.tsx`
- Do NOT bypass shadcn/ui components
- Do NOT create huge component files (> 200 lines) — always split
- Do NOT hardcode text in frontend components (must use `messages/` folder)
- Do NOT hardcode strings in backend/packages without dedicated constant files

### When in Doubt

Look at existing patterns in:

- `src/features/home/components/` (good component examples)
- `src/features/auth/` (current auth implementation)
- `packages/database/src/schemas/` (Drizzle schema patterns)

### Test Runner Policy

- Always use `bun:test` runner (import from `"bun:test"`)
- Command: `bun test` or `bun test <file>`
- Never suggest vitest or jest unless explicitly asked
- **Mocking**: Mock at system boundaries only (e.g., database queries, external services like `authService`, Next.js runtime like `next/headers`).
- **Mock setup**: When mocking modules, use `vi.mock()` before dynamically importing the module under test using `await import("./my.action")` to ensure the mock is hoisted correctly by `bun:test`.
- **DOM Testing**: The project currently does not use DOM testing libraries (e.g., `@testing-library/react`). Focus on testing actions and services.
