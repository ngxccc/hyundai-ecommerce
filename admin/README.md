# Hyundai Nhật Năng - Admin Portal

The administrative dashboard for the Hyundai Ecommerce project, designed to manage products, orders, customers, and overall business operations.

## Tech Stack

This application is built with a modern, high-performance web stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Internationalization (i18n)**: [next-intl](https://next-intl-docs.vercel.app/)
- **Package Manager**: [Bun](https://bun.sh/)

## Monorepo Context

This application is part of a larger Turborepo monorepo. It relies on shared packages located in the `packages/` directory for database schemas, ESLint configurations, and TypeScript configurations.

## Folder Structure

The application follows a feature-based folder structure inside the `src/` directory to keep code modular and maintainable:

```text
apps/admin/
├── app/                  # Next.js App Router (Layouts, Pages, Metadata)
│   └── [locale]/         # i18n dynamic route segment for all pages
├── messages/             # Translation files (vi.json, en.json)
├── src/
│   ├── features/         # Feature-based modules (e.g., dashboard, products)
│   │   ├── dashboard/    # Components and logic specific to the Dashboard
│   │   └── products/     # Components and logic specific to Products management
│   ├── i18n/             # i18n routing and configuration setup
│   └── shared/           # Shared components, hooks, config, and utilities
│       ├── components/ui/# shadcn/ui components
│       ├── lib/          # Utility functions (e.g., cn wrapper)
│       └── styles/       # Global CSS (Tailwind)
```

## Getting Started

Since this is a workspace in a monorepo, you can start the development server from the root of the project using Turborepo filters:

```bash
# Run only the admin app
bun --filter=admin run dev

# Or run all apps in the monorepo
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) (or whichever port is assigned) with your browser to see the result.

## Key Architecture Rules

- **Feature-Driven Architecture**: Business logic and components are grouped by feature in `src/features/` rather than by file type.
- **Server Components by Default**: Next.js App Router favors Server Components. Use `"use client"` only at the leaf nodes (for interactivity and client-side hooks).
- **Hardcoded Text is Forbidden**: All visible text MUST be translated using `next-intl`. Use `useTranslations("Namespace")` for client components and `getTranslations()` for server components and metadata.
- **UI Components**: Always use or build upon `shadcn/ui` components located in `src/shared/components/ui`. Avoid writing raw HTML tags (`<button>`, `<select>`, etc.) for standard UI elements.

## Internationalization (i18n)

The application fully supports multiple languages (currently Vietnamese `vi` and English `en`).

- Translation JSONs are located in `/messages`.
- Routes are wrapped in the `[locale]` dynamic segment.
- Metadata is dynamically generated per-page using `next-intl/server` `getTranslations`.
- For client-side navigation, use the custom `Link` component from `@/i18n/routing` instead of `next/link` to automatically handle locale prefixes.

## Deployment

The application is optimized to be deployed on Vercel as a Next.js App. Run the build command from the root using Turbo:

```bash
bun run build
```
