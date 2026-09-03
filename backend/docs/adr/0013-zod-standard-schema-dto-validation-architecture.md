# 13. Zod Standard Schema DTO Validation, Sanitization, and RFC 9457 Flattening Architecture

Date: 2026-08-30  
Deciders: Team / Core Architecture

### Metadata

- **ID**: `ADR-0013`
- **Status**: `Accepted`
- **Date**: `2026-08-30`
- **Feature**: `api-infrastructure`
- **Topic**: `DTO Schema Validation, Zod v4, Standard Schema Integration, RFC 9457 Flattening, Strict Whitelisting, and i18n Localization`
- **Target Module**: `src/common/pipes/zod-validation.pipe.ts`, `src/common/schemas/zod-primitives.ts`, `src/common/filters/global-exception.filter.ts`, `src/modules/*/dto/`, `test/benchmarks/`
- **Spec Reference**: Issue #79, `ADR-0012` (Sentry Observability Architecture), `ADR-0003` (Route Constants vs Router Module), `docs/design/zod-dto-validation-workflow.md`

---

## Status

Accepted

---

## Context

In high-concurrency ticket booking platforms handling high-velocity HTTP traffic (`POST /auth/register`, `POST /shows/batch`, `POST /bookings/reserve`), incoming request payload validation and sanitization serve as the first line of defense against malformed inputs, SQL/XSS injections, and parameter tampering.

The legacy validation infrastructure built upon `class-validator` + `class-transformer` + `reflect-metadata` presents four critical architectural bottlenecks:

1. **Type Drift and Dual-Declaration Vulnerability**:
   TypeScript types and class-validator decorators are maintained in disjoint systems. When a DTO field type changes without updating its corresponding decorators, the TypeScript compiler passes cleanly while runtime validation fails silently or permits invalid data types into the service layer.
2. **Runtime Reflection & Garbage Collection Overhead**:
   `class-transformer` executes `plainToInstance()`, allocates class instances on the V8/Bun heap, traverses prototype chains, and performs dynamic metadata reflection on every incoming HTTP request. In high-concurrency workloads (10,000+ RPS), this generates unnecessary garbage collection pressure and CPU overhead.
3. **Clunky Composition & Fragile Inheritance**:
   Reusing and composing partial DTOs via NestJS utility helpers (`PartialType`, `IntersectionType`, `OmitType`) frequently drops decorator metadata across multi-level inheritance, leading to subtle runtime validation bugs.
4. **Standard Schema decouping in NestJS v12**:
   NestJS v12 natively adopts the **Standard Schema** specification (`@standard-schema/spec`), enabling schema-first validation libraries (Zod, Valibot, ArkType) to integrate seamlessly without vendor lock-in or heavyweight reflection frameworks.

---

## Decision

We decided to establish a Schema-First DTO Validation and Sanitization Architecture powered by **Zod** and NestJS v12 Standard Schema, structured across 7 foundational pillars:

1. **Schema-First Single Source of Truth (SSOT)**:
   - All HTTP request DTOs are declared as Zod schemas (`export const registerSchema = z.object({...}).strict()`).
   - TypeScript types are strictly inferred via `export type RegisterDto = z.infer<typeof registerSchema>`, eliminating dual declaration and type drift.
2. **Standard Schema Native Custom Pipe (`ZodValidationPipe`)**:
   - Implement a lightweight, zero-reflection `ZodValidationPipe` implementing NestJS `PipeTransform`.
   - Executes `schema.safeParse(value)` synchronously. On validation failure, extracts `ZodError.issues` and flattens them into RFC 9457 `invalidParams: [{ name, reason }]`.
   - Throws standard NestJS `BadRequestException({ detail: i18nZodMsg("common.INVALID_INPUT"), invalidParams })` conforming to the existing RFC 9457 exception pipeline.
3. **Dot/Bracket Nested Path Serialization**:
   - Field names in RFC 9457 `invalidParams` are serialized using dot and bracket notation (e.g., `timeSlots[2]`, `customer.address.city`), providing exact path attribution for frontend form mapping.
4. **Decoupled i18n Localization via `GlobalExceptionFilter`**:
   - Zod schemas declare localization keys via the existing `i18nMsg("validation.key")` utility, outputting structured tokens `key|{args_json}`.
   - `GlobalExceptionFilter` catches the `BadRequestException`, decodes the pipe-separated tokens, and translates them dynamically based on the request's `x-lang` header. Schema definitions remain pure, static, and independent of HTTP execution context.
5. **Strict Whitelisting Guard (`.strict()`)**:
   - All DTO schemas enforce `.strict()`, rejecting unrecognized payload keys with HTTP 400 Bad Request to prevent Mass Assignment and Prototype Pollution vulnerabilities.
6. **Reusable Primitives & Safe Coercion (`zod-primitives.ts`)**:
   - Centralize reusable validation rules in `src/common/schemas/zod-primitives.ts`:
     - `zSanitizedString()`: HTML entity stripping and whitespace trimming.
     - `zEmail()`: Normalized, lowercased, and sanitized email validator.
     - `zPassword()`: Minimum 8 characters, uppercase, digit, and special character enforcement.
     - `zPhoneNumber()`: 10-digit Vietnamese phone number regex validation.
     - `zUuidV7()`: RFC 9562 UUIDv7 format validation.
     - `zBooleanString()` / `zNumericString()`: Safe query-param coercion preventing Boolean `"false"` truthy pitfalls.
7. **OpenAPI 3.1 & Scalar Reference Bridge**:
   - DTO classes for Swagger/Scalar generation wrap Zod schemas via `createZodDto()` (from `nestjs-zod` or Standard Schema OpenAPI bridge), preserving `bun run openapi:generate` and `test/generated/api-schema.d.ts` contracts.

---

## Consequences

- **Guaranteed Type Safety**: TypeScript types and validation schemas are physically impossible to drift.
- **Improved CPU & Memory Profile**: Eliminates `reflect-metadata` scanning and class instantiation on every HTTP request cycle.
- **Zero API Breaking Change**: Clients receive identical RFC 9457 Problem Details responses (`application/problem+json`) with localized error strings.
- **Clean Deprecation**: Completely removes `class-validator` and `class-transformer` from `package.json`.

### Explicit Tradeoffs

- **Zod Schema Declaration vs Class Syntax**: Developers define schemas functionally with Zod rather than adding decorators to class properties.
- **Custom Coercion Rules vs Implicit Casting**: Query parameters require explicit primitive helpers (`zNumericString`) instead of implicit `class-transformer` `@Type()` coercion.
- **Strict Parsing Overhead vs Permissive Strip**: `.strict()` requires slight CPU validation to check for unexpected keys, accepted in exchange for strict API security.
