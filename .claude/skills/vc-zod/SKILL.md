---
name: vc-zod
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
   - **MUST** use Zod v4 top-level format validators (e.g., `z.uuid()`, `z.url()`, `z.email()`). See general guide: [zod/references/schema-string-validations.md](../zod/references/schema-string-validations.md).

2. **Payload Security**:
   - **MUST** explicitly append `.strict()` or `.strip()` to request and Server Action payloads to prevent unvalidated field injection. See [zod/references/parse-never-trust-json.md](../zod/references/parse-never-trust-json.md).

3. **Localized Error Handling**:
   - **MUST** define validation error messages as namespace-prefixed localization key strings (e.g. `errors.invalid_email`, `validation.required`) instead of raw text.
   - **MUST** use the unified `error` param in Zod v4 schemas instead of deprecated `message`/`required_error`/`invalid_type_error` params. See [zod/references/error-custom-messages.md](../zod/references/error-custom-messages.md).
   - **MUST** parse inputs using `safeParse()` in action handlers. See [zod/references/parse-use-safeparse.md](../zod/references/parse-use-safeparse.md).
   - **MUST** support Zod v4 issue codes (`"invalid_format"`) when mapping validation errors.
4. **Database Integration**:
   - **MUST NOT** import Zod schemas directly inside Drizzle configuration or schema files (`*.schema.ts`) to avoid circular dependencies. Mapped schemas must live in validators or dedicated validation directories.

5. **Type Safety & Resolver Integration (Zod v4)**:
   - **MUST NOT** reference `ZodTypeDef` when writing custom generic helper functions or resolvers under Zod v4 (it is no longer exported in classic/v4). Instead, use `z.ZodType<TFieldValues, z.ZodTypeDef, unknown>` or simply `z.ZodType<TFieldValues, any, any>` to remain compatible.
   - **MUST** use `z.core.$ZodType<TFieldValues, any>` or `z.ZodType<TFieldValues, any, any>` when defining custom validation wrappers or resolvers in react-hook-form. Under Zod v4, using generic types like `z.ZodTypeAny` defaults schema inference to `unknown`, which violates the `FieldValues` constraint. Refer to react-hook-form Discussion #13205 (https://github.com/orgs/react-hook-form/discussions/13205) for implementation details.
## References

For general Zod v4 validation guidelines, formatting rules, and error handling patterns:
- Refer to the comprehensive [zod](../zod/SKILL.md) skill.

For detailed local implementation patterns and templates:
- Load `references/zod-best-practices.md` for form design, Action boundaries, and custom multi-field refinements.
- Load `references/drizzle-zod-integration.md` for mapping table configurations to insert, select, and update schemas.
- `validate payload with Zod`
- `define zod schema for validation`
- `drizzle schema to zod`
- `zod custom validation errors`
