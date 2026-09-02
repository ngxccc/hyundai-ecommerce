# API Design & Error Handling Standards

## 1. RESTful URL & Route Naming Conventions

- **Resource-Oriented & Plural Nouns**: Routes MUST use plural nouns in lowercase `kebab-case` (`/api/products`, `/api/categories/:categoryId/products`, `/api/warehouses`).
- **Command vs Query Distinction**:
  - State retrieval (Idempotent, Safe): `GET /api/products/:id`, `GET /api/orders/:id`
  - Resource creation: `POST /api/products`
  - High-intent Business Actions (Commands): Use sub-action nouns (`POST /api/checkout`, `POST /api/quotes/submit`, `POST /api/payments/payos-webhook`).

---

## 2. Standard Response Envelope

All successful JSON responses MUST adhere to the generic `ApiResponseDto` envelope:

```json
{
  "success": true,
  "data": {
    "id": "019fa8bc-8f4d-7000-b366-e691f45cfb91",
    "status": "active"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

- **Empty / Void Actions** (`200 OK` or `204 No Content`): Return `{ "success": true, "data": null }`.

---

## 3. RFC 9457 Problem Details for Error Responses

All error responses across HTTP exceptions, validation failures, and unhandled errors MUST follow the **RFC 9457 standard**:

- **Content-Type**: `application/problem+json`
- **Structure**:

```json
{
  "type": "https://api.hyundai-ecommerce.com/errors/conflict",
  "title": "Conflict",
  "status": 409,
  "detail": "Product inventory in warehouse is insufficient for the requested quantity.",
  "instance": "/api/checkout",
  "invalidParams": [
    {
      "name": "quantity",
      "reason": "Requested 5 units but only 2 remain in stock."
    }
  ]
}
```

---

## 4. HTTP Status Code Decision Matrix

| Status Code             | Meaning                   | When to Use                                                             |
| :---------------------- | :------------------------ | :---------------------------------------------------------------------- |
| `200 OK`                | Success with payload      | Successful `GET`, `PUT`, `PATCH`, or idempotent state update.           |
| `201 Created`           | Resource created          | Successful `POST` creating an entity (returns location/payload).        |
| `400 Bad Request`       | Client syntax error       | DTO validation failure, malformed JSON, missing headers.                |
| `401 Unauthorized`      | Missing / Invalid Auth    | Bearer token missing, expired, revoked, or signature invalid.           |
| `403 Forbidden`         | Insufficient Permissions  | User authenticated but lacks Role (RBAC) or account suspended.          |
| `404 Not Found`         | Entity Missing            | Querying a non-existent UUID or missing route.                          |
| `409 Conflict`          | State / Stock Conflict    | Inventory race condition, quote revision collision, unique key collision. |
| `422 Unprocessable`     | Business Rule Violation   | Valid format but impossible domain action (e.g. canceling a fulfilled order). |
| `429 Too Many Requests` | Rate Limit Exceeded       | Redis Throttler triggered limit for IP/user.                            |
| `500 Internal Error`    | Unexpected Server Crash   | Sanitized error response; raw details logged privately.                 |

---

## 5. Idempotency Key Handling

- **Header**: `Idempotency-Key: <UUIDv4 / UUIDv7>`
- **Behavior**:
  - Mutating operations (`POST /api/checkout`, PayOS payment webhooks) MUST record the key in Redis with a 24-hour TTL.
  - Concurrent duplicate requests with the same key return the original response without re-executing side-effects.

---

## 6. TypeScript Type & Interface Naming Standards

- **No Hungarian Prefixes**: Never prefix interfaces with `I` (use `AuthService`, not `IAuthService`) or types with `T` (use `PaymentPayload`, not `TPaymentPayload`).

### Naming Conventions Summary Table

| Construct                      | Convention                                | Example (Good)                            | Anti-Pattern (Avoid)                       |
| :----------------------------- | :---------------------------------------- | :---------------------------------------- | :----------------------------------------- |
| **Interfaces**                 | `PascalCase`                              | `AuthService`, `InvalidParam`             | `IAuthService`, `IInvalidParam`            |
| **Type Aliases**               | `PascalCase`                              | `SentryBreadcrumbCategory`, `Nullable<T>` | `TSentryBreadcrumbCategory`, `type_sentry` |
| **Enums & Objects as Const**   | `PascalCase` / `UPPER_SNAKE_CASE`         | `SENTRY_BREADCRUMB_CATEGORY`              | `sentryBreadcrumbCategory`                 |
| **Generics / Type Parameters** | Single uppercase or `PascalCase` with `T` | `T`, `TData`, `TResult`, `TError`         | `data_type`, `t`                           |
| **Functions & Methods**        | `camelCase`                               | `hashPassword`, `canActivate`             | `HashPassword`, `hash_password`            |
| **Constants**                  | `UPPER_SNAKE_CASE`                        | `DEFAULT_REDLOCK_OPTIONS`                 | `defaultRedlockOptions`                    |
