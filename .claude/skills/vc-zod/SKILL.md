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
   - **MUST** parse inputs using `safeParse()` in action handlers instead of throwing raw Zod exceptions.

4. **Database Integration**:
   - **MUST NOT** import Zod schemas directly inside Drizzle configuration or schema files (`*.schema.ts`) to avoid circular dependencies. Mapped schemas must live in validators or dedicated validation directories.

## References

For detailed implementation patterns and templates:
- Load `references/zod-best-practices.md` for form design, Action boundaries, and custom multi-field refinements.
- Load `references/drizzle-zod-integration.md` for mapping table configurations to insert, select, and update schemas.

Trigger phrases:
- `validate payload with Zod`
- `define zod schema for validation`
- `drizzle schema to zod`
- `zod custom validation errors`
