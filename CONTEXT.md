# CONTEXT

Single source of truth for the domain language used across this repository.

## Repository Scope

This repo is a B2B e-commerce platform for industrial equipment, focused on generators and related power systems.

Use these terms consistently in code, docs, and architecture reviews.

## Core Terms

- **Storefront**: the customer-facing web app in `apps/storefront`.
- **Docs**: the technical documentation site in `apps/docs`.
- **Industrial equipment**: the products sold in the platform, especially generators and power systems.
- **Generator**: a primary product category in the storefront.
- **Product**: a sellable item in the catalog.
- **Category**: a product grouping used for navigation and filtering.
- **News article**: editorial or technical content shown in the storefront news section.
- **Promotion**: a seasonal or marketing campaign shown on the storefront.
- **Quote**: a requested or negotiated price for a product or order.
- **Dealer tier**: a pricing or access level for business customers.

## Business Terms

- **B2B account**: an account created by a business customer.
- **B2C account**: an account created by an individual customer.
- **Dealer**: a reseller or distributor partner.
- **Contractor**: a construction or installation customer.
- **Distributor**: an official distribution partner.
- **End user**: the final individual customer.
- **Province / city**: the geographic address field used in registration.

## Technical Terms

- **Auth form schema**: the validation schema that defines login and registration input.
- **Auth action**: a server action that handles login or registration.
- **Shared contract**: a type or interface used by multiple packages.
- **Production build**: the Next.js build phase used for prerendering and static generation.
- **Action result union**: a discriminated union type (usually containing `success: boolean`) returned by server actions to signify either success data or validation/system errors.
- **System boundary**: an external dependency (like database, 3rd-party API, or framework runtime) that should be mocked during unit testing.
- **Sub-barrel**: an `index.ts` file within a feature's subfolder (e.g., `features/dashboard/hooks/index.ts`) used to export related items without bloating a root feature barrel file.
- **Deep import**: importing a specific file directly (e.g., `@/features/dashboard/components/client-button`) rather than through a barrel file, highly recommended for avoiding Next.js Server/Client boundary leaks.

## Naming Rules

- Prefer the domain terms above over generic labels like "service" when the domain concept is clearer.
- Use "Storefront" for the app, not "frontend".
- Use "Product" for catalog items, not "item".
- Use "Quote" for negotiated pricing flows, not "request" unless the request is specifically the initial quote request.
- Use "Dealer", "Contractor", "Distributor", and "End user" exactly as written when referring to account types.

## Notes

- The storefront uses localized messages for user-facing text.
- The database package is the source of truth for auth form schemas.
- The `@nhatnang/types` package owns shared contracts such as auth action/result types and product specs.
- Shared packages should contain only contracts that are intentionally reused across modules.

## Architectural Guidelines

- **Schema-Driven Design (SDD)**: Các Entity Types (như `IProduct`, `IUser`) BẮT BUỘC phải được suy luận trực tiếp từ Drizzle Schema (ví dụ `typeof schema.$inferSelect`). Các Service Interface giao tiếp với Database cũng phải được đặt cùng thư mục (co-located) với Service Implementation tại `packages/database` để dùng chung type này, tránh Lỗi Circular Dependency và đảm bảo Single Source of Truth.
- **TDD & Test Co-location**: Unit tests (using `bun:test`) MUST be co-located directly next to their implementation files (e.g., `product.services.test.ts` next to `product.services.ts`). Do not put them in a separate `__tests__` folder unless strictly necessary.
- **Zod Schema Separation**: Zod validation schemas used for Server Actions and UI Forms MUST be strictly separated from Drizzle ORM database schemas. They should be placed in dedicated validator files (e.g., `packages/database/src/validators/`) to decouple UI validation logic from database structure.
- **Fat Service over Repository Pattern**: Đối với các thao tác CRUD cơ bản bằng Drizzle ORM, hãy nhúng trực tiếp Drizzle queries vào bên trong `services/` (Fat Service pattern). Tránh việc tạo ra các hàm mapping 1:1 thừa thãi trong thư mục `queries/`. Thư mục `queries/` chỉ được sử dụng cho các câu truy vấn SQL cực kỳ phức tạp (như Analytics, Aggregation nhiều bảng) để tránh làm phình to (bloat) logic của Service.
- **Manual Dependency Injection (Constructor Injection)**: Mọi thao tác DB bên trong Service đều phải gọi qua `this.db` được truyền vào qua Constructor. Khi chạy Drizzle Transaction, bắt buộc phải tạo Service instance giả lập: `const txService = new XyzService(tx)`. Mọi Service Singletons (chạy `db` gốc) phải được khởi tạo tập trung tại `packages/database/src/services/registry.ts`.
