# 3. Zod as Single Source of Truth for OpenAPI Documentation, Validation, and Contract Integrity

Date: 2026-09-08

## Status

Accepted

## Context

Prior to this architectural decision, the NestJS backend used the standard `@nestjs/swagger` Code-First paradigm paired with standalone Zod request schemas. This architecture produced a severe **duplication gap** and recurring **API Contract Drift**:

1. **Dual Maintenance & Boilerplate**:
   - **For Requests**: Developers wrote a Zod schema (e.g., `createProductSchema`) for runtime validation through `ZodValidationPipe`, and then manually wrote a duplicate TypeScript class (`CreateProductDto`) populated with `@ApiProperty()` and `@ApiPropertyOptional()` decorators exclusively for Swagger.
   - **For Responses**: Developers wrote standalone TypeScript classes with `@ApiProperty()` decorators, with zero runtime schema validation.
2. **Silent Contract Drift**:
   - NestJS Swagger decorators are runtime metadata functions, not compile-time type enforcers. A controller method can return an arbitrary object structure while decorating `@ApiResponse({ type: ProductResponseDto })`, and the TypeScript compiler (`tsc`) will not report an error.
   - Example values in `@ApiProperty({ example: ... })` accept `unknown` / `any`. Developers frequently hardcoded string literals (e.g., `"CONFIRMED"` on order status or `"PENDING"` on quote queries) that deviated from canonical database enums without raising compile-time or linter errors.
3. **Nullability & Frontend Type Mismatch**:
   - PostgreSQL nullable columns return `null` at runtime.
   - Under `@nestjs/swagger`, `@ApiPropertyOptional()` only marks a field as not required; it generates `"type": "string"` in OpenAPI 3.1.0 unless explicitly augmented with `{ nullable: true }`.
   - Consequently, frontend code generators (`openapi-typescript`) emitted `field?: string` (permitting `undefined`, but rejecting `null`). When the API returned `null`, frontend components suffered runtime type mismatches and TypeScript compilation failures under strict null checking.
4. **Alternative Paradigms Evaluated**:
   - **Spec-First / Contract-First (TypeSpec / OpenAPI YAML)**: Requires writing external API specification files prior to implementation. While offering strong contract enforcement via generated interfaces, it conflicts with NestJS's core developer experience (requiring whole-object parameter extraction instead of `@Param('id')`, slowing down agile feature iteration).
   - **Contract Testing Only (`toSatisfyApiSpec()`)**: Effective as a verification safety net, but treats the symptom rather than the disease, leaving manual decorator duplication and developer friction intact.

---

## Decision

We migrate to **Zod as the Single Source of Truth (SSOT)** for all API contracts across the NestJS backend via `nestjs-zod`:

### 1. Schema-Driven DTO Definition (`createZodDto`)

All Data Transfer Objects (Requests and Responses) MUST be derived directly from canonical Zod schemas using `createZodDto`:

```typescript
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ORDER_STATUSES } from "@/database/schemas/enums.schema";

export const orderResponseSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable().optional(),
  status: z.enum(ORDER_STATUSES),
  depositAmount: z.string().nullable().optional(),
  totalAmount: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class OrderResponseDto extends createZodDto(orderResponseSchema) {}
```

- **Elimination of Manual Decorators**: Class declarations no longer contain manual `@ApiProperty()` or `@ApiPropertyOptional()` annotations.
- **Zero Field Duplication**: The schema defines runtime validation rules, TypeScript types (`z.infer`), and OpenAPI schema definitions in one unified location.

### 2. Automated OpenAPI 3.1 Metadata Derivation

The `nestjs-zod` plugin and compiler hooks automatically translate Zod validation rules into OpenAPI 3.1.0 specifications:

- `z.enum(ORDER_STATUSES)` $\rightarrow$ Automatically outputs the OpenAPI `enum` constraint, guaranteeing 100% alignment with database schema definitions.
- `.nullable()` $\rightarrow$ Automatically generates OpenAPI 3.1 union type `"type": ["string", "null"]`, emitting `string | null` in generated frontend client types.
- `.optional()` $\rightarrow$ Excludes the property from OpenAPI `required` arrays.
- Examples and documentation are declared directly on schema nodes via `.describe()` or Zod OpenAPI metadata helpers.

### 3. Runtime Response Validation Interceptor (Dev & CI Test Environments)

To catch contract drift before code reaches production, we introduce a global response validation interceptor (`ZodResponseValidationInterceptor`):

- **Development & CI/Test**: The interceptor parses controller return payloads against the associated response Zod schema. If a service query omits a required field, returns unexpected null values, or alters an enum value, an error is thrown immediately during local development and automated integration testing.
- **Production**: Response parsing is bypassed to ensure zero CPU latency and serialization overhead on production workloads.

### 4. Phased Migration Architecture

Migration proceeds in four discrete domain waves:

1. **Wave 1 — Infrastructure & Foundation**:
   - Install and configure `nestjs-zod` (v5+ with native Zod 4 & OpenAPI 3.1 support).
   - Configure `cleanupOpenApiDoc(document, { version: "3.1" })` in `openapi.config.ts` and `generate-openapi-types.ts` (modernized replacement for deprecated `patchNestJsSwagger`).
   - Implement `ZodResponseValidationInterceptor` for dev/test environments with automated schema extraction from `@Api*ResponseGeneric`, `@ApiOkResponsePaginated`, and `nestjs-zod`'s `@ZodResponse`.
2. **Wave 2 — Financial & Transactional Domains**:
   - Migrate `quotes`, `orders`, and `payments` modules to `createZodDto`.
3. **Wave 3 — Catalog & Inventory Domains**:
   - Migrate `catalog` (products, categories, brands), `warehouse`, and `cart` modules.
4. **Wave 4 — Identity & CRM Domains**:
   - Migrate `auth`, `users`, `leads`, and `dealer-tiers` modules.

---

## Consequences

- **Zero Duplication**: Eliminates over 1,500 lines of boilerplate `@ApiProperty()` annotations across 60+ DTO classes.
- **Immunity to Enum & Nullability Drift**: Enums and nullable fields cannot diverge between code and documentation because the OpenAPI specification is directly compiled from the runtime Zod schema.
- **Synchronized Frontend Types**: `bun run types:sync` generates exact, non-drifting TypeScript types for Next.js applications (`storefront` and `admin`).
- **Immediate Drift Detection in CI**: Developers cannot break an API contract without failing local integration tests.

### Explicit Tradeoffs

- **DTO Refactoring Effort**:
  - _Tradeoff_: Approximately 60 existing DTO files across 10 modules must be refactored from class-based decorators to Zod schemas.
  - _Mitigation_: Phased migration by domain wave ensures existing endpoints remain functional during the transition; `createZodDto` produces classes that are 100% backward compatible with NestJS controller signatures.
- **Response Validation CPU Overhead**:
  - _Tradeoff_: Running `schema.parse()` on large arrays of response entities adds serialization latency.
  - _Mitigation_: Response validation is strictly gated to `NODE_ENV !== "production"`. Production environments execute standard fast serialization.
