<div align="center">

# Hyundai E-Commerce Admin Portal

### Enterprise Backoffice Management System for Industrial Power Equipment & B2B Quotations

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Bun](https://img.shields.io/badge/Bun-1.4-000000?logo=bun&logoColor=white)](https://bun.sh)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Components-161618?logo=radix-ui&logoColor=white)](https://www.radix-ui.com)
[![next-intl](https://img.shields.io/badge/next--intl-i18n-38A169)](https://next-intl-docs.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Architectural Highlights

- **Server-First Next.js 16 Architecture**: Leverages React Server Components (RSC), Next.js Server Actions, and granular streaming boundaries (`Suspense`) for ultra-fast dashboard initialization.
- **Contract-Driven API Integration**: Direct zero-overhead API communication powered by `openapi-fetch` (`api.METHOD`) with compile-time DTO schemas in `src/types/api.ts` synchronized directly from the backend OpenAPI contract.
- **B2B Industrial Quotation Management**: Full-featured quote negotiation suite supporting live margin adjustments, approval workflows, DIN/ISO-compliant B2B print documents, and Excel quote exports (`exceljs`).
- **Catalog & Inventory Operations**: Multi-tiered product management with specification matrices, multi-image Cloudinary media galleries, quote-only flags, and multi-warehouse stock adjustments.
- **Strict Server-Only API Boundaries**: All mutations and sensitive API calls execute exclusively through Server Actions and Server Components; no client credentials or raw tokens leak to the browser bundle.
- **Type-Safe Dynamic Metadata & i18n**: Type-checked internationalization (`vi` & `en`) via `next-intl` with automated message key compilation and dynamic metadata generation (`Promise<Metadata>`) across all dashboard routes.
- **Strict Zod Environment Validation**: Runtime configuration verified during boot via `@t3-oss/env-nextjs` to catch missing or malformed variables immediately.

---

## System Architecture

```text
admin/
├── app/                  # Next.js App Router (Layouts, Pages & Metadata)
│   └── [locale]/         # Dynamic locale segment (vi / en)
│       ├── (auth)/       # Authentication views (Login, Session verify)
│       └── (dashboard)/  # Protected backoffice routes
│           ├── products/ # Product catalog management
│           ├── quotes/   # B2B quotation negotiation & print view
│           ├── orders/   # Order processing & invoice generation
│           ├── stock/    # Inventory & warehouse batch tracking
│           └── ...
├── messages/             # i18n translation dictionaries (vi.json, en.json)
├── src/
│   ├── features/         # Feature-sliced modules (components, actions, schemas)
│   ├── lib/              # API client (`api` via openapi-fetch), utilities
│   ├── types/            # DTO type definitions (`api.ts`, `api-schema.d.ts`)
│   ├── shared/           # Reusable UI components, hooks, and services
│   └── env.ts            # T3 Env validation schema
├── docs/                 # Engineering standards & operational guides
└── .github/              # Standalone Polyrepo-Ready CI/CD workflows
```

---

## Quickstart

### Prerequisites

- **Bun** `v1.4+`
- **Backend API Service** running at `http://localhost:3000` (or staging backend)
- **Doppler CLI** (Optional, for managing environment secrets)

### Setup & Run

```bash
# 1. Install dependencies
bun install

# 2. Synchronize OpenAPI DTO types from Backend
bun run types:pull

# 3. Generate i18n type definitions
bun run typegen:i18n

# 4. Start development server (Port 3002)
bun run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

---

## Environment Configuration

Validated at startup via `@t3-oss/env-nextjs` (`src/env.ts`):

| Variable                            | Scope  | Required | Default                 | Purpose                                            |
| :---------------------------------- | :----: | :------: | :---------------------- | :------------------------------------------------- |
| `PORT`                              | Server |    No    | `3002`                  | Local dev server port                              |
| `NODE_ENV`                          | Server |    No    | `development`           | Runtime mode (`development`, `production`, `test`) |
| `BACKEND_API_URL`                   | Server |    No    | `http://127.0.0.1:3000` | Target URL for backend REST API calls              |
| `CLOUDINARY_API_KEY`                | Server | **Yes**  | _None_                  | Cloudinary credentials for media upload            |
| `CLOUDINARY_API_SECRET`             | Server | **Yes**  | _None_                  | Cloudinary signing secret                          |
| `NEXT_PUBLIC_APP_URL`               | Client |    No    | `http://localhost:3002` | Canonical URL of the Admin Portal                  |
| `NEXT_PUBLIC_STOREFRONT_URL`        | Client |    No    | `http://localhost:3001` | URL of the Customer Storefront                     |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client | **Yes**  | _None_                  | Cloudinary cloud bucket name                       |

---

## Available Scripts

```bash
# Development & Build
bun run dev              # Start dev server on port 3002 with Doppler
bun run build            # Compile production Next.js build
bun run start            # Launch compiled production server

# Quality & Verification
bun run check-types      # Validate TypeScript types (tsc --noEmit)
bun run lint             # Run ESLint with auto-fix and caching
bun run test             # Execute unit test suites (bun test)

# Contract & Code Generation
bun run types:pull       # Pull and generate api-schema.d.ts from backend
bun run typegen:i18n     # Generate type declarations for next-intl messages
```

---

## Architecture & Engineering Standards

- **Architecture Principles**: Deep module design & component boundaries in [`docs/standards/code-architecture-and-design-principles.md`](docs/standards/code-architecture-and-design-principles.md).
- **Testing Standards**: Test isolation and fixtures in [`docs/standards/testing-and-fixtures.md`](docs/standards/testing-and-fixtures.md).
- **Security & Tokens**: Safe token storage and sanitization in [`docs/standards/security-and-cryptography.md`](docs/standards/security-and-cryptography.md).
- **Git Flow & PR Matrix**: Conventional commits and review in [`docs/standards/git-flow-and-pr-matrix.md`](docs/standards/git-flow-and-pr-matrix.md).

---

## License

Distributed under the MIT License. See `LICENSE` for details.
