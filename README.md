<div align="center">

# Hyundai E-Commerce Platform

### Enterprise B2B & B2C Industrial Power Equipment & Quotation Negotiation System

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NestJS-11.2-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Bun-1.4-000000?logo=bun&logoColor=white)](https://bun.sh)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-8.0-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Scalar API Docs](https://img.shields.io/badge/Scalar_UI-OpenAPI_3.1-00B4D8)](https://scalar.com)
[![Sentry](https://img.shields.io/badge/Sentry-Observability-362D59?logo=sentry&logoColor=white)](https://sentry.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Overview

**Hyundai E-Commerce** is a modern, enterprise-grade industrial machinery e-commerce and B2B Request for Quotation (RFQ) platform. Built specifically for high-value power equipment (three-phase diesel generators, agricultural machinery, industrial water pumps, and emergency backup power solutions), the system features dynamic multi-tier quotation workflows, warehouse batch stock tracking, PayOS payment integration, and high-concurrency order settlement.

---

## Live Services & Port Matrix

| Service                 | Technology              | Local Port | Production URL                                                                    | Description                                              |
| :---------------------- | :---------------------- | :--------: | :-------------------------------------------------------------------------------- | :------------------------------------------------------- |
| **REST API Server**     | NestJS 11 + Drizzle ORM |  `:3000`   | [api.hyundainhatnang.ngxc.io.vn](https://api.hyundainhatnang.ngxc.io.vn/api/docs) | Core backend, database queries, and OpenAPI contract     |
| **Customer Storefront** | Next.js 16 (App Router) |  `:3001`   | [hyundainhatnang.ngxc.io.vn](https://hyundainhatnang.ngxc.io.vn)                  | Customer catalog, quote submission, and shopping cart    |
| **Admin Portal**        | Next.js 16 (App Router) |  `:3002`   | [admin.hyundainhatnang.ngxc.io.vn](https://admin.hyundainhatnang.ngxc.io.vn)      | Backoffice dashboard, quote approvals, orders, inventory |

---

## Architecture Overview

The repository adopts a **Decoupled Standalone Multi-Application Architecture (Polyrepo-Ready)**. Each package operates independently with its own configuration, dependencies, test runner, and localized `.github/` workflows:

```text
.
├── backend/            # NestJS 11 REST API Service
│   ├── src/modules/    # Domain modules (catalog, quotes, orders, warehouse, etc.)
│   ├── openapi.json    # OpenAPI 3.1.0 Contract Specification (Single Source of Truth)
│   ├── docs/standards/ # 11 Full Operational Engineering Standards
│   └── .github/        # Independent CI/CD (Postgres/Redis services, Render release)
│
├── admin/              # Next.js 16 Backoffice Admin Dashboard
│   ├── app/[locale]/   # App Router (Dashboard, Products, Quotes, Orders, Stock)
│   ├── src/lib/        # Zero-overhead typed client (`api` via openapi-fetch)
│   ├── docs/standards/ # Frontend Engineering Standards
│   └── .github/        # Independent CI/CD (Vercel deploy)
│
├── storefront/         # Next.js 16 Customer Storefront & B2B RFQ Portal
│   ├── app/[locale]/   # App Router (Shop, Products, B2B Quote Submission, Cart)
│   ├── src/lib/        # Typed API client with compile-time DTO schemas
│   ├── docs/standards/ # Frontend Engineering Standards
│   └── .github/        # Independent CI/CD (Vercel deploy)
│
├── docs/standards/     # Central Engineering Standards Reference
├── docker-compose.yml  # Local PostgreSQL 18 & Redis 8 infrastructure
├── package.json        # Root coordination & verification scripts
└── .github/workflows/  # Thin Monorepo CI/CD orchestrators with path filtering
```

### Architectural Pillars

1. **Decoupled Standalone Applications**:
   - Zero workspace cyclic dependencies or compile-time coupling.
   - Ultra-fast LSP / TSServer response times (<200MB memory footprint).
   - Effortless zero-rework separation into 3 independent Git repositories whenever desired.
2. **Backend Delegation & Pure Single Source of Truth**:
   - Frontend applications (`admin`, `storefront`) act as pure API consumers without database dependencies.
   - Database operations (PostgreSQL, Drizzle ORM, ACID transactions, Redis Redlock) live strictly inside `backend/`.
3. **Contract-Driven API (OpenAPI 3.1 & Scalar)**:
   - Backend exports `backend/openapi.json` and serves live interactive docs at `/api/docs`.
   - Dual-mode type synchronization: offline `bun run types:sync` at root, or standalone `bun run types:pull` in each frontend.
4. **B2B Industrial Quotation Engine**:
   - High-value industrial machinery is sold via quote negotiation (`REQUESTED` → `REVIEWING` → `APPROVED` → `REJECTED` → `EXPIRED`).
   - DIN/ISO-compliant B2B commercial print documents and Excel export (`exceljs`).

---

## Quickstart

### Prerequisites

- **Bun** `v1.4+` (`curl -fsSL https://bun.sh/install | bash`)
- **Docker & Docker Compose** (PostgreSQL 18, Redis 8)
- **Doppler CLI** (Optional, for production secrets management)

### 1. Launch Local Infrastructure

```bash
# Start PostgreSQL 18 and Redis 8 containers
bun run docker:up
```

### 2. Install Dependencies

```bash
# Install dependencies across all packages in one command
bun run install:all
```

### 3. Initialize Database & Seed Fixtures

```bash
cd backend
bun run db:migrate dev
bun run db:seed dev
cd ..
```

### 4. Run Development Servers

Run services simultaneously in separate terminals:

```bash
# Terminal 1: Backend API (http://localhost:3000 | Docs: http://localhost:3000/api/docs)
bun run dev:backend

# Terminal 2: Customer Storefront (http://localhost:3001)
bun run dev:storefront

# Terminal 3: Backoffice Admin Portal (http://localhost:3002)
bun run dev:admin
```

---

## Contract-Driven Type Synchronization

When backend APIs, DTOs, or routes are modified:

```bash
# Option A: Monorepo Mode (Offline, generates openapi.json and syncs types across packages)
bun run types:sync

# Option B: Polyrepo Mode (Run inside admin or storefront to pull schema from running API)
cd admin && bun run types:pull
cd storefront && bun run types:pull
```

---

## Root Orchestration Scripts

The root `package.json` provides scripts to coordinate all 3 applications:

| Script                   | Purpose                                                            |
| :----------------------- | :----------------------------------------------------------------- |
| `bun run dev:backend`    | Starts the NestJS API server with live watch mode (Port 3000)      |
| `bun run dev:storefront` | Starts the Customer Storefront dev server (Port 3001)              |
| `bun run dev:admin`      | Starts the Backoffice Admin dev server (Port 3002)                 |
| `bun run check-types`    | Typechecks all 3 applications in sequence (`tsc --noEmit`)         |
| `bun run lint`           | Runs strict ESLint analysis across all 3 applications              |
| `bun run test`           | Executes unit and integration tests across all packages            |
| `bun run test:backend`   | Runs NestJS backend unit tests                                     |
| `bun run types:sync`     | Generates `openapi.json` and updates TypeScript schema definitions |
| `bun run format:pkg`     | Formats and alphabetizes all `package.json` files via Syncpack     |
| `bun run docker:up`      | Starts local PostgreSQL 18 and Redis 8 Docker containers           |
| `bun run docker:down`    | Stops and tears down local Docker containers                       |

---

## CI/CD & Deployment Architecture

- **Quality Gate (`.github/workflows/ci.yml`)**: Triggered on pull requests to `main`. Runs typecheck, linting, tests, and production build across all packages. Automatically ignores documentation files (`**/*.md`, `docs/**`).
- **Continuous Deployment (CD)**:
  - **Backend (`.github/workflows/backend.yml`)**: Monitored via `paths-filter`. Deploys database migrations via Doppler and triggers Render production webhook.
  - **Admin & Storefront (`admin.yml`, `storefront.yml`)**: Monitored via `paths-filter`. Compiles and releases prebuilt production artifacts to Vercel.
  - **Zero-Noise Documentation Filtering**: All CD deploy pipelines strictly exclude markdown and documentation changes (`paths-ignore` & `!**/*.md`), preventing unintended deployments on doc edits.

---

## Architecture & Engineering Standards

Operational standards are maintained in [`docs/standards/`](docs/standards/) and localized within each package's `docs/standards/`:

- **Database & Migrations**: Schema rules & Drizzle practices in [`docs/standards/database-and-migrations.md`](docs/standards/database-and-migrations.md).
- **Concurrency & Locking**: Pessimistic locks & Redlock in [`docs/standards/concurrency-and-locking.md`](docs/standards/concurrency-and-locking.md).
- **API Design & Errors**: REST conventions & RFC 9457 errors in [`docs/standards/api-design-and-error-handling.md`](docs/standards/api-design-and-error-handling.md).
- **Architecture Principles**: Module depth & DRY/AHA balance in [`docs/standards/code-architecture-and-design-principles.md`](docs/standards/code-architecture-and-design-principles.md).
- **Testing & Fixtures**: Isolation and test fixtures in [`docs/standards/testing-and-fixtures.md`](docs/standards/testing-and-fixtures.md).
- **Git Flow & PR Matrix**: Conventional Commits & code reviews in [`docs/standards/git-flow-and-pr-matrix.md`](docs/standards/git-flow-and-pr-matrix.md).

---

## License

Distributed under the MIT License. See `LICENSE` for details.
