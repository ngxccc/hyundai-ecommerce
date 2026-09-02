# Testing & Fixture Standards

## 1. Test Suite Hierarchy & Naming Conventions

All test suites (`*.test.ts`) MUST adhere to the standardized BDD hierarchical structure using `bun:test`:

- **Level 1 (Domain Boundary / Service Root)**: `describe("<Domain> Service Integration", () => { ... })` or `describe("<Domain> Module", () => { ... })`
- **Level 2 (Method / Endpoint Scope)**: Pure method name or route — `describe("createOrder()", () => { ... })` or `describe("POST /api/checkout", () => { ... })`. Never append custom parenthetical qualifiers to Level 2.
- **Level 2.5 (Context / Scenarios — Optional)**: When a method/endpoint encompasses multiple distinct scenarios (validation, concurrency, edge cases), group them using `describe("when <context/scenario>", () => { ... })`.
- **Level 3 (Test Case)**: `test("should <action and expected outcome> when <condition>", async () => { ... })` (or `it(...)`).

```ts
import { expect, test, describe, beforeEach, vi } from "bun:test";

describe("OrderService", () => {
  describe("createOrder()", () => {
    describe("when validating inventory availability", () => {
      test("should throw InsufficientStockError when requested quantity exceeds warehouse stock", async () => {
        // Arrange, Act, Assert
      });
    });

    describe("when handling concurrency and race conditions", () => {
      test("should acquire locks in sorted order and process order atomically", async () => {
        // Arrange, Act, Assert
      });
    });
  });

  describe("updateOrderStatus()", () => {
    test("should update status and increment product sales cache when transition is PENDING to PROCESSING", async () => {
      // Arrange, Act, Assert
    });
  });
});
```

---

## 2. Test Data Factory & Object Mother Patterns

- **Factory Pattern**: Use `create<Entity>(db, overrides)` with `Partial<TNewEntity> = {}` to automatically resolve parent relationships.
- **Object Mother Pattern**: Centralize domain presets (`ProductMother.standard()`, `UserMother.dealer()`, `OrderMother.pending()`).
- **Auth Helper**: Use `createAuthenticatedSession()` to get a mock user session without cross-package HTTP requests.

---

## 3. SUT Boundary & Cross-Module Test Isolation

- **Testing the Auth Service (`auth.service.test.ts`)**: Exercise authentication and password verification directly as the System Under Test (SUT).
- **Testing Other Services (`order.service.test.ts`, `product.service.test.ts`, `quotes.service.test.ts`)**: DO NOT invoke auth services to create users. Mock DB/session or seed directly via `UserMother` to eliminate test coupling and keep unit execution sub-millisecond.

---

## 4. Contract-Driven Assertions & Anti-Pattern Protections

### A. Single Envelope Boundary

- **Rule**: Pure database services (`packages/database/src/services`) MUST return raw domain objects, DTOs, or primitives (`ProductDTO`, `TOrder`, `null`). Services NEVER construct or return HTTP `ApiResponse` envelopes.
- **Responsibility**: Next.js Route Handlers and Server Actions alone are responsible for HTTP envelope wrapping and status code mapping.

### B. Prohibition of Tautological Mock Mirroring (Unit Tests)

- **Prohibition**: In Controller unit tests, NEVER reuse the mock service result variable inside the expected envelope assertion (`data: mockServiceResult`).
- **Requirement**: Assert explicit object literals with distinct root-level keys (`success`, `data`, `meta`) to prevent blind mock echoing from hiding double-nesting bugs.

```ts
// GOOD: Explicit literal assertion validating envelope structure
expect(response).toEqual({
  success: true,
  data: [{ id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a", slug: "inverter-generator-3kw" }],
  meta: { page: 1, limit: 10, total: 1 },
});

// BANNED: Tautological mock echoing (masks double wrapping)
expect(response).toEqual({ success: true, data: mockProductListResponse });
```

### C. Prohibition of Retrofitting Assertions (Integration Tests)

- **Prohibition**: Never adapt an integration test expectation to match unexpected controller output (e.g. changing `body.data` to `body.data.data`) without validating against `docs/standards/api-design-and-error-handling.md`.
- **Requirement**: Integration tests MUST assert schema compliance against the OpenAPI contract (`test/generated/api-schema.d.ts`), verifying array root structures (`Array.isArray(body.data)`) and root `body.meta`.

---

## 5. OpenAPI Contract-First Type Assertions

- **PROHIBITION**: Never declare local, hand-rolled response interfaces inside test files (`interface UserProfile { ... }`).
- **MANDATORY**: Import schema types from the generated OpenAPI specification (`test/generated/api-schema.d.ts`):

```ts
import type { components } from "../generated/api-schema";

type UserProfileData = components["schemas"]["UserResponseDto"];
type GetProfileResponse = components["schemas"]["ApiResponseDto"] & {
  data: UserProfileData;
};
type Rfc9457ErrorResponse = components["schemas"]["Rfc9457ErrorResponseDto"];
```

---

## 6. Database & State Isolation (Schema-per-Worker Architecture)

- **Dynamic Schema Provisioning**: Every integration test suite binds to a unique PostgreSQL schema (`test_${randomUUID().replace(/-/g, '_')}`) via `options: "-c search_path=<worker_schema>,public"` in the PostgreSQL `Pool` (ADR 0010).
- **Extension Resolution**: Retain `public` in `search_path` to resolve global database extensions (e.g. `btree_gist`).
- **`beforeEach` Truncation**: Run `truncateAllTables(db)` which queries `WHERE schemaname = current_schema()` with `sql.identifier()` to clear transactional tables strictly within the worker's isolated schema without cross-worker deadlocks.
- **Redis Namespace Isolation**: In integration tests, configure IoRedis with `keyPrefix: "test:${workerSchemaId}:"` and BullMQ with `prefix: "bull:${workerSchemaId}"` to prevent cross-worker lock and job interference.
- **Background Scheduler Guardrails**: Disable cron handlers (`process-outbox`, `expire-orders`) during test execution unless explicitly testing the cron endpoint.
- **Lifecycle Teardown**: Clean up the provisioned schema in `afterAll()` via `DROP SCHEMA IF EXISTS <worker_schema> CASCADE;`, and close all background Redis connections and timers.

---

## 7. Performance Benchmarks & Stress Testing (`test/benchmarks/`)

All performance benchmark suites (`test/benchmarks/<domain>.bench.ts`) MUST strictly adhere to the 7 Production Benchmarking Invariants in [`docs/standards/benchmarking-and-performance-testing.md`](benchmarking-and-performance-testing.md).
