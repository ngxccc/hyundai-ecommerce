---
name: vc:zod
description: "Rules, standards, and references for validating schemas, payloads, database mappings, and formatting user-facing validation errors using Zod."
license: MIT
argument-hint: "[--schema <path>] [--payload <json>]"
metadata:
  author: Team
  version: "1.0.0"
---

# Zod Validation & Schema Standards

This skill defines the development guidelines and architectural rules for data validation, payload parsing, and Drizzle mapping using Zod.

## Core Rules

1. **Modern Schema Methods**:
   - **MUST** use `z.uuid()` instead of `z.string().uuid()` for UUID validation.
   - **MUST** use `z.url()` instead of `z.string().url()` for URL validation.
   - **MUST** use `z.email()` instead of `z.string().email()` for email validation.
   
2. **Payload Security**:
   - **MUST** explicitly append `.strict()` or `.strip()` to request and Server Action payloads to prevent unvalidated field injection.

3. **Localized Error Handling**:
   - **MUST** define validation error messages as namespace-prefixed localization key strings (e.g. `errors.invalid_email`, `validation.required`) instead of raw text.
   - **MUST** use the unified `error` param (e.g., `z.string().min(5, { error: "..." })`) instead of `errorMap` or `message` for custom error mappings in Zod v4 schemas (`errorMap` is deprecated/renamed to `error`).
   - **MUST** parse inputs using `safeParse()` in action handlers instead of throwing raw Zod exceptions.
   - **MUST** support Zod v4 issue codes (`"invalid_format"`) and properties (`"format"`) when mapping validation errors (Zod v4 uses `"invalid_format"` instead of Zod v3's `"invalid_string"`).
4. **Database Integration**:
   - **MUST NOT** import Zod schemas directly inside Drizzle configuration or schema files (`*.schema.ts`) to avoid circular dependencies. Mapped schemas must live in validators or dedicated validation directories.

5. **Type Safety & Resolver Integration (Zod v4)**:
   - **MUST NOT** reference `ZodTypeDef` when writing custom generic helper functions or resolvers under Zod v4 (it is no longer exported in classic/v4). Instead, use `z.ZodType<TFieldValues, z.ZodTypeDef, unknown>` or simply `z.ZodType<TFieldValues, any, any>` to remain compatible.
   - **MUST** use `z.core.$ZodType<TFieldValues, any>` or `z.ZodType<TFieldValues, any, any>` when defining custom validation wrappers or resolvers in react-hook-form. Under Zod v4, using generic types like `z.ZodTypeAny` defaults schema inference to `unknown`, which violates the `FieldValues` constraint. Refer to react-hook-form Discussion #13205 (https://github.com/orgs/react-hook-form/discussions/13205) for implementation details.
## References

For detailed implementation patterns and templates:
- Load `references/zod-best-practices.md` for form design, Action boundaries, and custom multi-field refinements.
- Load `references/drizzle-zod-integration.md` for mapping table configurations to insert, select, and update schemas.

Trigger phrases:
- `validate payload with Zod`
- `define zod schema for validation`
- `drizzle schema to zod`
- `zod custom validation errors`
