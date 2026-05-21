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

### Server vs Client Components

- Default to Server Components (`"use server"` is implicit)
- Only add `"use client"` when absolutely necessary (hooks, browser APIs, client state)
- Prefer Server Actions over API routes whenever possible

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

#### Import/Export Rules

- Use named exports for child components and utilities
- Only use `export default` for `page.tsx` and `layout.tsx`
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

### Monorepo Rules (Turborepo)

- Never import directly from `apps/` into `packages/`
- Use workspace protocol: `"@nhatnang/database": "workspace:*"`
- Run commands with `bun --filter=storefront run dev`

### Authentication (Better Auth)

- Always use `authClient` from `@/shared/lib/auth-client`
- Never manually hash passwords — Better Auth handles it
- Registration flow must collect: `fullName`, `email`, `phone`, `companyName`, `taxId`, `businessType`, `province`

### Database (Drizzle)

- All queries go through `packages/database`
- Use transactions (`withTransaction`) for multi-table operations
- Never write raw SQL unless absolutely necessary

### Internationalization & Hardcoded Text

**Frontend (Next.js):**

- Never hardcode text in components
- All strings must live in the `messages/` folder:
  - `messages/en.json`
  - `messages/vi.json`
- Use `next-intl` (or equivalent) for translations

**Backend / Packages / Shared code:**

- Create dedicated files for constants/messages (`constants.ts`, `messages.ts`, `errors.ts`)
- Never hardcode strings directly in backend logic

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
