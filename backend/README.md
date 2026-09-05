<div align="center">

# Hyundai E-Commerce API

### High-Performance & Concurrency-Safe B2B/B2C Industrial Power Equipment Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NestJS-11.2-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![Bun](https://img.shields.io/badge/Bun-1.4-000000?logo=bun&logoColor=white)](https://bun.sh)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-8.0-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Scalar API Docs](https://img.shields.io/badge/Scalar_UI-OpenAPI_3.1-00B4D8)](https://scalar.com)
[![Sentry](https://img.shields.io/badge/Sentry-Observability-362D59?logo=sentry&logoColor=white)](https://sentry.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Architectural Highlights

- **B2B Industrial Quotation Engine**: Full lifecycle quote negotiation (`REQUESTED` → `REVIEWING` → `APPROVED` → `REJECTED` → `EXPIRED`) with dealer pricing tiers, expiration scheduling, and automated commercial PDF/Excel document rendering.
- **Concurrency-Safe Stock Allocation**: Eliminates inventory overselling under high traffic using Redis **Redlock** distributed locking combined with PostgreSQL row-level locks (`SELECT ... FOR UPDATE`).
- **Transactional Outbox Event Relay**: Decouples database transactions from async notifications (BullMQ workers + Resend emails) with resilient at-least-once delivery semantics.
- **PayOS Payment Gateway & Webhook Idempotency**: Automated VietQR payment link generation, HMAC-SHA256 signature verification, anti-replay guards, and Redis-backed `Idempotency-Key` tracking.
- **Role-Based Access Control (RBAC) & Dealer Tiers**: Granular permissions across `ADMIN`, `STAFF`, `DEALER`, and `CUSTOMER` with dynamic tier-based volume discount calculation.
- **Contract-Driven API (OpenAPI 3.1 & Scalar)**: Single Source of Truth (`backend/openapi.json` and `/api/docs`) enforcing standardized generic and paginated response envelopes.
- **Enterprise Observability & RFC 9457**: Integrated Sentry APM with automated PII masking, 4xx/5xx noise separation, and standardized RFC 9457 problem detail error responses.

---

## System Architecture

```text
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # Authentication, JWT rotation & sessions
│   │   ├── users/          # User management & profile operations
│   │   ├── dealer-tiers/   # B2B dealer tier discount matrices
│   │   ├── leads/          # Customer inquiry and sales leads
│   │   ├── catalog/        # Products, Categories, Brands & Specifications
│   │   ├── warehouse/      # Inventory stock batches & multi-warehouse allocation
│   │   ├── cart/           # Shopping cart sessions & reservation
│   │   ├── quotes/         # B2B quote requests, revisions & PDF/Excel export
│   │   ├── orders/         # Order processing, state machines & tracking
│   │   ├── payments/       # PayOS QR generation & webhook reconciliation
│   │   ├── outbox/         # Transactional outbox polling & event dispatch
│   │   └── mail/           # Resend email templates & delivery
│   ├── database/           # Drizzle ORM schemas, relations & migrations
│   ├── common/             # Interceptors, filters, guards, decorators & Redlock
│   ├── env.ts              # Zod type-safe environment validation
│   └── main.ts             # Application bootstrap & Scalar UI integration
├── test/                   # Unit, E2E, and OpenAPI contract test suites
├── drizzle/                # Drizzle SQL migration snapshots
└── docs/                   # ADRs, Domain Models & Engineering Standards
```

---

## API Reference

Interactive OpenAPI 3.1 documentation is dynamically served by **Scalar UI**:

- **Interactive API UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **OpenAPI 3.1 JSON Contract**: [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)

### Core Endpoints

| Domain         | Method & Route                                                         | Auth                     | Description                                                         |
| :------------- | :--------------------------------------------------------------------- | :----------------------- | :------------------------------------------------------------------ |
| **Auth**       | `POST /api/v1/auth/login`<br>`POST /api/v1/auth/refresh`               | Public / Refresh Token   | Authenticate user, issue access token & rotate refresh tokens.      |
| **Catalog**    | `GET /api/v1/products`<br>`GET /api/v1/products/:slug`                 | Public                   | Paginated product search with category, brand, and spec filters.    |
| **B2B Quotes** | `POST /api/v1/quotes`<br>`PATCH /api/v1/quotes/:id/status`             | Bearer JWT / Admin       | Submit quote request, negotiate pricing, and approve/reject quotes. |
| **Cart**       | `GET /api/v1/cart`<br>`POST /api/v1/cart/items`                        | Bearer JWT / Guest Token | Manage persistent and guest cart items with stock verification.     |
| **Orders**     | `POST /api/v1/orders`<br>`GET /api/v1/orders/:id`                      | Bearer JWT               | Create order from cart or approved quote, track delivery status.    |
| **Payments**   | `POST /api/v1/payments/create-link`<br>`POST /api/v1/payments/webhook` | Bearer JWT / Signature   | Generate PayOS checkout QR; handle HMAC-SHA256 payment webhooks.    |
| **Warehouse**  | `GET /api/v1/warehouses/stock`<br>`POST /api/v1/warehouses/adjust`     | Bearer JWT (`admin`)     | Multi-warehouse stock level tracking and batch reconciliation.      |

---

## Quickstart

### Prerequisites

- **Bun** `v1.4+`
- **Docker & Docker Compose** (PostgreSQL 18, Redis 8)
- **Doppler CLI** (Optional, for managing environment secrets)

### Setup & Run

```bash
# 1. Install dependencies
bun install

# 2. Start PostgreSQL and Redis containers
docker compose up -d

# 3. Apply database migrations
bun run db:migrate dev

# 4. Seed initial database fixtures (admin accounts, catalog, warehouses)
bun run db:seed dev

# 5. Start development server with live reload
bun run dev
```

Visit [http://localhost:3000/api/docs](http://localhost:3000/api/docs) to explore and execute API requests.

---

## Environment Configuration

Strictly validated on boot via Zod schema (`src/env.ts`):

| Variable                                           | Required | Default             | Purpose                                                |
| :------------------------------------------------- | :------: | :------------------ | :----------------------------------------------------- |
| `PORT`                                             |    No    | `3000`              | HTTP port                                              |
| `NODE_ENV`                                         |    No    | `development`       | Environment mode (`development`, `production`, `test`) |
| `DB_HOST`                                          |    No    | `localhost`         | PostgreSQL host                                        |
| `DB_PORT`                                          |    No    | `5432`              | PostgreSQL port                                        |
| `DB_USERNAME`                                      |    No    | `postgres`          | PostgreSQL user                                        |
| `DB_PASSWORD`                                      |    No    | `postgrespassword`  | PostgreSQL password                                    |
| `DB_DATABASE`                                      |    No    | `hyundai_ecommerce` | Database name                                          |
| `REDIS_HOST`                                       |    No    | `localhost`         | Redis host                                             |
| `REDIS_PORT`                                       |    No    | `6379`              | Redis port                                             |
| `JWT_SECRET`                                       | **Yes**  | _Min 32 chars_      | JWT signing secret key                                 |
| `JWT_ACCESS_EXPIRES_IN`                            |    No    | `15m`               | Access token TTL                                       |
| `JWT_REFRESH_EXPIRES_IN`                           |    No    | `7d`                | Refresh token TTL                                      |
| `PAYOS_CLIENT_ID` / `API_KEY` / `CHECKSUM_KEY`     | **Yes**  | _None_              | PayOS VietQR payment credentials                       |
| `RESEND_API_KEY`                                   | **Yes**  | _None_              | Transactional email API key                            |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | **Yes**  | _None_              | Cloudinary media upload credentials                    |
| `SENTRY_DSN`                                       |    No    | _None_              | Sentry APM error reporting DSN                         |

---

## Available Scripts

```bash
# Development & Build
bun run dev              # Start NestJS dev server with watch mode
bun run build            # Compile TypeScript to dist/
bun run start            # Run compiled production build

# Quality & Verification
bun run check-types      # Typecheck codebase without emitting (tsc --noEmit)
bun run lint             # Run ESLint with auto-fix and caching
bun run format           # Format codebase via Prettier

# Database & Migrations
bun run db:generate      # Generate SQL migrations from Drizzle schemas
bun run db:migrate       # Apply migrations (pass config: dev | test | prd)
bun run db:seed          # Seed database fixtures
bun run db:studio        # Open Drizzle Studio web GUI

# Testing & Contract Validation
bun run test             # Run unit tests
bun run test:ci          # Run tests with coverage and JUnit XML report
bun run test:e2e         # Run end-to-end integration tests
bun run types:generate   # Export openapi.json and synchronize schema types
```

---

## Architecture & Engineering Standards

- **Engineering Standards**: 11 operational standards in [`docs/standards/`](docs/standards/).
- **Database & Migrations**: Schema conventions in [`docs/standards/database-and-migrations.md`](docs/standards/database-and-migrations.md).
- **Concurrency & Redlock**: Locking policies in [`docs/standards/concurrency-and-locking.md`](docs/standards/concurrency-and-locking.md).
- **API Design & Errors**: REST conventions in [`docs/standards/api-design-and-error-handling.md`](docs/standards/api-design-and-error-handling.md).

---

## License

Distributed under the MIT License. See `LICENSE` for details.
