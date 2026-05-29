# CONTEXT

Single source of truth for the domain language, architecture, and processes used across this repository.

## 1. Repository Structure & Tech Stack

This is a greenfield B2B e-commerce platform for industrial equipment (generators and power systems).

- **Monorepo**: Turborepo (v2.9.16)
- **Package Manager**: Bun (v1.3.6)
- **Framework**: Next.js 16.2.6 (App Router) & React 19
  - `apps/storefront`: Customer-facing web app (UI: shadcn/ui 4.8.3, Tailwind CSS)
  - `apps/admin`: Internal dashboard for staff/admins
  - `apps/docs`: Technical documentation site
- **Database**: PostgreSQL with Drizzle ORM (v1.0.0-rc.3, located in `packages/database`)
- **Auth**: Better Auth (v1.6.11)
- **Validation**: Zod (v4.4.3)
- **Testing**: Bun Test (`bun:test`)
- **Shared Packages**: `database`, `shared`, `ui`, `types`, `eslint-config`, `typescript-config`

## 2. Core Business Flow: Quote & Deal Negotiation

The most critical flow in the system is not self-service checkout, but rather a CRM-style B2B Quote/Deal negotiation process:

1. **Initiation**: A user (Dealer, Contractor, etc.) fills out a request/contact form for a quote.
2. **Notification**: The system alerts the Admin or Sales staff.
3. **Negotiation**: Takes place offline or via external channels (Zalo, phone calls) or future in-app integrations.
4. **Closing the Deal**: Admins input the finalized details (adjusted price, shipping fees, etc.) into the system to log the success/failure history of the deal.

## 3. Domain Language

- **Storefront**: the customer-facing web app in `apps/storefront`.
- **Docs**: the technical documentation site in `apps/docs`.
- **Industrial equipment**: the products sold in the platform, especially generators and power systems.
- **Generator**: a primary product category in the storefront.
- **Product**: a sellable item in the catalog.
- **Category**: a product grouping used for navigation and filtering.
- **News article**: editorial or technical content shown in the storefront news section.
- **Promotion**: a seasonal or marketing campaign shown on the storefront.
- **Quote / Deal**: a requested or negotiated price for a product or order, ending in a logged deal history.
- **Dealer tier**: a pricing or access level for business customers.

### Account Types (`business_type`)

- **Dealer**: a reseller or distributor partner. Can have a `dealer_tier` (discount percentage and minimum spend).
- **Contractor**: a construction or installation customer.
- **Distributor**: an official distribution partner.
- **End user**: the final individual customer (B2C).

## 4. Architectural Guidelines

- **Schema-Driven Design (SDD)**: Các Entity Types (như `IProduct`, `IUser`) BẮT BUỘC phải được suy luận trực tiếp từ Drizzle Schema (ví dụ `typeof schema.$inferSelect`). Các Service Interface giao tiếp với Database cũng phải được đặt cùng thư mục (co-located) với Service Implementation tại `packages/database` để dùng chung type này, tránh Lỗi Circular Dependency và đảm bảo Single Source of Truth.
- **TDD & Test Co-location**: Unit tests (using `bun:test`) MUST be co-located directly next to their implementation files (e.g., `product.services.test.ts` next to `product.services.ts`). Do not put them in a separate `__tests__` folder unless strictly necessary.
- **Zod Schema Separation**: Zod validation schemas used for Server Actions and UI Forms MUST be strictly separated from Drizzle ORM database schemas. They should be placed in dedicated validator files (e.g., `packages/database/src/validators/`) to decouple UI validation logic from database structure.
- **Fat Service over Repository Pattern**: Đối với các thao tác CRUD cơ bản bằng Drizzle ORM, hãy nhúng trực tiếp Drizzle queries vào bên trong `services/` (Fat Service pattern). Tránh việc tạo ra các hàm mapping 1:1 thừa thãi trong thư mục `queries/`. Thư mục `queries/` chỉ được sử dụng cho các câu truy vấn SQL cực kỳ phức tạp (như Analytics, Aggregation nhiều bảng) để tránh làm phình to (bloat) logic của Service.
- **Manual Dependency Injection (Constructor Injection)**: Mọi thao tác DB bên trong Service đều phải gọi qua `this.db` được truyền vào qua Constructor. Khi chạy Drizzle Transaction, bắt buộc phải tạo Service instance giả lập: `const txService = new XyzService(tx)`. Mọi Service Singletons (chạy `db` gốc) phải được khởi tạo tập trung tại `packages/database/src/services/registry.ts`.

## 5. Technical Terms

- **Auth form schema**: the validation schema that defines login and registration input.
- **Auth action**: a server action that handles login or registration.
- **Shared contract**: a type or interface used by multiple packages.
- **Production build**: the Next.js build phase used for prerendering and static generation.
- **Action result union**: a discriminated union type (usually containing `success: boolean`) returned by server actions to signify either success data or validation/system errors.
- **System boundary**: an external dependency (like database, 3rd-party API, or framework runtime) that should be mocked during unit testing.
- **Sub-barrel**: an `index.ts` file within a feature's subfolder (e.g., `features/dashboard/hooks/index.ts`) used to export related items without bloating a root feature barrel file.
- **Deep import**: importing a specific file directly (e.g., `@/features/dashboard/components/client-button`) rather than through a barrel file, highly recommended for avoiding Next.js Server/Client boundary leaks.

## 6. Naming Rules

- Prefer the domain terms above over generic labels like "service" when the domain concept is clearer.
- Use "Storefront" for the app, not "frontend".
- Use "Product" for catalog items, not "item".
- Use "Quote / Deal" for negotiated pricing flows.

## 7. Architecture Decision Records (ADR)

When creating ADRs in `docs/adr/`, follow these strict rules:

- **Language**: English only.
- **Numbering**: Must follow sequential numbering (e.g., `0004-xyz.md`).
- **Structure**: Must contain exactly these sections in order:
  1. `# <Number>. <Title>`
  2. `Date: <YYYY-MM-DD>`
  3. `## Status` (e.g., Accepted)
  4. `## Context`
  5. `## Decision`
  6. `## Consequences`
- Use "Dealer", "Contractor", "Distributor", and "End user" exactly as written when referring to account types.

## 8. Notes

- The storefront uses localized messages for user-facing text.
- The database package is the source of truth for auth form schemas.
- The `@nhatnang/types` package owns shared contracts such as auth action/result types and product specs.
- Shared packages should contain only contracts that are intentionally reused across modules.
