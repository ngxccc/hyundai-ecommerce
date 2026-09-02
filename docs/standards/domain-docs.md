# Domain Documentation Standards

## 1. Domain SSOT: `CONTEXT.md` & Ubiquitous Language

- **File**: `CONTEXT.md` at repository root.
- **Rule**: Every code identifier (entity, DTO property, table, route, test name) MUST strictly use terms defined in `CONTEXT.md`. Never introduce synonyms or ad-hoc translations.

---

## 2. Architectural Decision Records (ADRs)

- **Location**: `docs/adr/NNNN-<kebab-case-title>.md`.
- **Review Gate**: Read relevant ADRs before modifying database schemas, authentication, caching, locking, or queue structures.
- **Contradictions**: When requirements invalidate an existing ADR, record the trade-off in a new or superseding ADR before changing code.

---

## 3. Type System SSOT & Derivation

### A. Colocation Discipline

- **Single-Use Types**: Place helper types, props, and parameter interfaces in the implementation file where used.
- **Domain & Service Types**: Place domain service interfaces and service-scoped DTOs in `packages/database/src/services/<domain>/<domain>.interface.ts` and `packages/database/src/dtos/<domain>.dto.ts`.
- **Database Schema Types**: Place schemas and inferred model types in `packages/database/src/schemas/<domain>.schema.ts`.
- **Cross-Package Shared Types**: Place application-wide primitives, payment contracts, and utility types in `packages/shared/src/`.
### B. Schema-First Derivation

- **Database SSOT**: Infer row types directly from Drizzle tables (`typeof table.$inferSelect`, `typeof table.$inferInsert`). Never hand-write duplicate entity interfaces.
- **API SSOT**: Infer request/response types from validation schemas (`z.infer<typeof schema>`).
- **Subtypes**: Derive subsets using TypeScript utility types (`Pick`, `Omit`, `Partial`) over new manual declarations.

---

## 4. Documentation Drift Prevention

- **Prohibition**: Never copy-paste raw TypeScript type declarations into Markdown documentation (`*.md`).
- **Automated Contracts**: DTO schemas (`packages/database/src/dtos/`) and validation schemas (`packages/database/src/validators/`) are the sole interface references.
- **Symbol Referencing**: Markdown specifications and workflows MUST reference code symbols by name and path (e.g. `CreateOrderDTO` in `packages/database/src/dtos/order.dto.ts` or `OrderService` in `packages/database/src/services/order/order.interface.ts`) rather than duplicating structural signatures.
- **Markdown Domain**: Limit Markdown documentation to business rationale, invariant matrices (`INV-N`), state machine transitions, and concurrency boundaries.

---

## 5. Domain Invariant Taxonomy (`INV-N`)

### A. Invariant Scoping

- Scope invariant IDs per domain module (`OrderDomainInvariants: INV-1..6`, `InventoryDomainInvariants: INV-1..4`, `QuoteDomainInvariants: INV-1..4`, `PaymentDomainInvariants: INV-1..4`, `AuthDomainInvariants: INV-1..4`).

### B. Traceability Chain

1. **Spec**: Define invariant logic in `docs/design/<feature>-workflow.md`.
2. **Code**: Guard invariant conditions in domain services with anchor comments `// Invariant: INV-X`.
3. **Tests**: Every invariant MUST have dedicated negative test cases asserting rejection upon violation.
