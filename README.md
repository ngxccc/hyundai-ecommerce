# Hyundai Ecommerce

## B2B Industrial Equipment E-Commerce Platform

A modern, enterprise-grade B2B e-commerce platform specializing in heavy machinery, industrial power generators (Hyundai, Cummins, Perkins, etc.), and emergency power systems. Built with complex Request for Quotation (RFQ) negotiation, multi-warehouse stock management, and high-concurrency order settlement.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B67F?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)](https://redis.io)

---

## Live Services & Endpoints

- **Customer Storefront**: [https://hyundainhatnang.ngxc.io.vn](https://hyundainhatnang.ngxc.io.vn)
- **Backoffice Admin Portal**: [https://admin.hyundainhatnang.ngxc.io.vn](https://admin.hyundainhatnang.ngxc.io.vn)
- **REST API & Interactive Docs**: [https://api.hyundainhatnang.ngxc.io.vn/api/docs](https://api.hyundainhatnang.ngxc.io.vn/api/docs) (Scalar UI)

---

## Architecture Overview

The repository adopts a **Decoupled Standalone Multi-Application Architecture**. All applications reside at the root level as independent projects with their own dependencies, configuration files, and build pipelines:

```text
.
├── backend/            # Standalone NestJS REST API Server
│   ├── src/modules/    # Domain modules (auth, catalog, quotes, orders, payments, warehouse, etc.)
│   ├── openapi.json    # OpenAPI 3.1.0 Contract Specification
│   └── package.json    # NestJS dependencies & test runner
│
├── storefront/         # Standalone Next.js 16 Customer & B2B RFQ Portal
│   ├── app/            # App Router (i18n, products, quote submission)
│   ├── src/lib/        # Typed REST API client communicating with backend
│   └── package.json    # Storefront dependencies
│
├── admin/              # Standalone Next.js 16 Backoffice Admin Dashboard
│   ├── app/            # App Router (products, warehouses, quotes, orders, finance)
│   ├── src/lib/        # Authenticated REST API client with Cookie JWT Bearer injection
│   └── package.json    # Admin dependencies
│
├── docker-compose.yml  # Local infrastructure (PostgreSQL 18 & Redis 8)
├── package.json        # Root coordination scripts
└── .syncpackrc         # Single source of truth package.json formatting
```

### Key Architectural Decisions

1. **Standalone Applications over Monorepo Workspaces**:
   - Eliminates cross-package dependency cycles and workspace caching overhead.
   - Drastically reduces Neovim/VSCode TSServer memory usage (<250MB) and ensures instant editor responsiveness.
2. **Backend Delegation**:
   - Frontend applications (`storefront`, `admin`) are thin consumers of backend REST API endpoints.
   - Database operations (Drizzle ORM, migrations, ACID transactions, Redlock distributed locking) are encapsulated exclusively within `backend/`.
3. **OpenAPI as Single Source of Truth**:
   - Backend exposes OpenAPI 3.1 schema at `/openapi.json` and interactive documentation with Scalar at `/api/docs`.
4. **B2B RFQ Negotiation Engine**:
   - Industrial generators and heavy equipment are sold via multi-round quote negotiations rather than direct retail cart checkout.
   - Supports live negotiation messaging, agreed price adjustments, and one-click approval to commercial orders.

---

## Tech Stack

- **Backend Service**:
  - NestJS 11 + Fastify adapter
  - Drizzle ORM + PostgreSQL 18
  - Redis 8 + Redlock distributed locking
  - OpenAPI 3.1.0 + Scalar API Reference
- **Frontend Applications**:
  - Next.js 16 (React 19, Server Components, Server Actions)
  - Tailwind CSS v4 + Radix UI components
  - Next-Intl (Vietnamese primary, English secondary)
  - Zustand (Client-side quote state management)
- **Infrastructure & Tooling**:
  - Runtime: Bun v1.3+
  - Local Database & Cache: Docker Compose (PostgreSQL 18-alpine, Redis 8-alpine)
  - Formatting & Linting: ESLint v9 (flat config), Prettier with Tailwind plugin, Syncpack

---

## Getting Started

### Prerequisites

- **Bun**: v1.3.6 or later (`curl -fsSL https://bun.sh/install | bash`)
- **Docker & Docker Compose**: For local PostgreSQL and Redis

### 1. Start Local Infrastructure

Start PostgreSQL and Redis containers in the background:

```bash
# Using root script
bun run docker:up

# Or via docker compose directly
docker compose up -d
```

### 2. Install Dependencies

Install dependencies across all applications:

```bash
# Root utilities
bun install

# Backend API
cd backend && bun install && cd ..

# Storefront App
cd storefront && bun install && cd ..

# Admin App
cd admin && bun install && cd ..
```

### 3. Database Migration & Seed

Initialize schemas and seed data for the backend:

```bash
cd backend
bun run db:migrate
bun run db:seed
cd ..
```

### 4. Launch Development Servers

Run applications independently using convenience root scripts:

```bash
# Terminal 1: Backend REST API (http://localhost:3000 | Docs: http://localhost:3000/api/docs)
bun run dev:backend

# Terminal 2: Customer Storefront (http://localhost:3001)
bun run dev:storefront

# Terminal 3: Backoffice Admin Portal (http://localhost:3002)
bun run dev:admin
```

---

## Root Orchestration Scripts

The root `package.json` provides scripts to manage all 3 applications:

| Command                    | Description                                                      |
| :------------------------- | :--------------------------------------------------------------- |
| `bun run dev:backend`      | Starts the NestJS backend in hot-reload development mode         |
| `bun run dev:storefront`   | Starts the Next.js storefront portal                             |
| `bun run dev:admin`        | Starts the Next.js admin dashboard                               |
| `bun run check-types`      | Executes TypeScript typecheck (`tsc --noEmit`) across all 3 apps |
| `bun run lint`             | Runs strict ESLint checks across all 3 apps                      |
| `bun run test`             | Executes unit test suites in storefront and admin                |
| `bun run test:backend`     | Executes backend unit and integration test suites                |
| `bun run format:pkg`       | Formats and alphabetizes all `package.json` files using Syncpack |
| `bun run format:pkg:check` | Verifies `package.json` formatting compliance (CI gate)          |
| `bun run docker:up`        | Starts local PostgreSQL and Redis containers                     |
| `bun run docker:down`      | Stops local containers                                           |
