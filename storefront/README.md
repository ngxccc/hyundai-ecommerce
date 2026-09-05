<div align="center">

# Hyundai E-Commerce Customer Storefront

### High-Performance Modern Web Storefront for Industrial Power Equipment & B2B Solutions

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

- **Next.js 16 Server-First Architecture**: Built on React Server Components (RSC), Next.js Cache Components, and streaming SSR (`Suspense`) for near-instant Initial Server Response and optimal Core Web Vitals.
- **Contract-Driven API Client**: Fully typed communication with the backend using `openapi-fetch` and compile-time schema definitions synchronized directly from `backend/openapi.json`.
- **Industrial Product Discovery**: High-performance catalog browsing with multi-faceted filtering (power capacity, fuel type, phase, brand, category) and comprehensive technical spec tables.
- **B2B Industrial Quotation Flow**: Dedicated quotation request flow for heavy-duty generators and commercial equipment marked as quote-only, capturing corporate requirements and buyer specs.
- **End-to-End Checkout & PayOS Integration**: Persistent shopping cart with guest and authenticated sessions, PayOS VietQR payment integration, and real-time order status tracking.
- **Customer Portal & Order Tracking**: Customer dashboard for reviewing quotation history, downloading invoices, and tracking shipment delivery status.
- **SEO & Structured Data (JSON-LD)**: Dynamic metadata generation (`generateMetadata`) combined with Schema.org JSON-LD microdata for rich search engine indexing.
- **Type-Safe Dynamic i18n**: Fully localized in Vietnamese (`vi`) and English (`en`) via `next-intl` with automated dictionary compilation.

---

## System Architecture

```text
storefront/
├── app/                  # Next.js App Router (Layouts, Pages & Routes)
│   └── [locale]/         # Dynamic locale routing (vi / en)
│       ├── (shop)/       # Catalog, product details, cart & checkout
│       ├── (portal)/     # Authenticated customer portal & quotes
│       └── ...
├── messages/             # i18n translation dictionaries (vi.json, en.json)
├── src/
│   ├── features/         # Feature modules (catalog, cart, quotes, orders)
│   ├── lib/              # API client (`openapi-fetch`), utilities
│   ├── types/            # DTO schemas (`api-schema.d.ts`)
│   ├── shared/           # Reusable UI components, hooks, icons
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

# 4. Start development server (Port 3001)
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Environment Configuration

Validated at startup via `@t3-oss/env-nextjs` (`src/env.ts`):

| Variable                        | Scope  | Required | Default                 | Purpose                                            |
| :------------------------------ | :----: | :------: | :---------------------- | :------------------------------------------------- |
| `PORT`                          | Server |    No    | `3001`                  | Local dev server port                              |
| `NODE_ENV`                      | Server |    No    | `development`           | Runtime mode (`development`, `production`, `test`) |
| `BACKEND_API_URL`               | Server |    No    | `http://127.0.0.1:3000` | Target URL for backend REST API calls              |
| `NEXT_PUBLIC_APP_URL`           | Client |    No    | `http://localhost:3001` | Canonical URL of the Storefront                    |
| `NEXT_PUBLIC_BANK_BIN`          | Client |    No    | `vietinbank`            | Bank BIN for direct transfer instruction           |
| `NEXT_PUBLIC_BANK_ACCOUNT_NO`   | Client |    No    | `123456789`             | Company bank account number                        |
| `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | Client |    No    | `HYUNDAI NHAT NANG`     | Company bank account holder name                   |

---

## Available Scripts

```bash
# Development & Build
bun run dev              # Start dev server on port 3001 with Doppler
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

- **Architecture Principles**: Component isolation & deep modules in [`docs/standards/code-architecture-and-design-principles.md`](docs/standards/code-architecture-and-design-principles.md).
- **Testing Standards**: Test isolation and mock policies in [`docs/standards/testing-and-fixtures.md`](docs/standards/testing-and-fixtures.md).
- **Security & Tokens**: Client-side storage and XSS mitigation in [`docs/standards/security-and-cryptography.md`](docs/standards/security-and-cryptography.md).
- **Git Flow & PR Matrix**: Conventional commits and review in [`docs/standards/git-flow-and-pr-matrix.md`](docs/standards/git-flow-and-pr-matrix.md).

---

## License

Distributed under the MIT License. See `LICENSE` for details.
