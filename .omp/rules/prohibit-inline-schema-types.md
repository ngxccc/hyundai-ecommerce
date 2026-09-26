---
name: prohibit-inline-schema-types
description: "Extract JSONB and domain types into backend/src/types/*.type.ts instead of declaring inline interfaces in schema files"
condition: "(?:export\\s+interface\\s+[A-Za-z0-9_]+|export\\s+type\\s+[A-Za-z0-9_]+\\s*=\\s*\\{)"
scope:
  [
    "tool:write(backend/src/database/schemas/*.schema.ts)",
    "tool:edit(backend/src/database/schemas/*.schema.ts)",
  ]
---

# Schema Domain Types

Separate domain types from database table schemas:

1. **Centralized Types**: Put JSONB and domain interfaces in `backend/src/types/<domain>.type.ts` (e.g. `product-spec.type.ts`).
2. **Schema Usage**: Import via `@/types/<domain>.type` and bind columns using `$type<T>()`.
