---
name: prohibit-inline-schema-types
description: "Enforce extracting domain/JSONB types into dedicated backend/src/types/*.type.ts files instead of defining them inline in schema files"
condition: "(?:export\\s+interface\\s+[A-Za-z0-9_]+|export\\s+type\\s+[A-Za-z0-9_]+\\s*=\\s*\\{)"
scope: "tool:write(backend/src/database/schemas/*.ts)"
---

# Schema Domain Type Separation Standards

- **No Inline Domain Types in Schemas**: Do NOT define custom JSONB TypeScript interfaces or complex type definitions directly inside `backend/src/database/schemas/*.schema.ts` files.
- **Centralized Domain Types**: Place all JSONB interfaces and Zod validation schemas in dedicated files under `backend/src/types/<domain>.type.ts` (e.g. `product-spec.type.ts`, `quote-commercial-terms.type.ts`, `company-settings.type.ts`).
- **Import References**: Import the domain types via `@/types/<domain>.type` into your schema files for use with `$type<T>()`.
