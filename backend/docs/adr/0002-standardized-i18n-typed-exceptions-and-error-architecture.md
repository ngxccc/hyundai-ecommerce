# 2. Standardized I18n Typed Exceptions and Centralized Error Architecture

Date: 2026-09-07

## Status

Accepted

## Context

Prior to this architecture decision, error handling and internationalization (i18n) across the NestJS backend suffered from severe fragmentation:

1. **Mixed Exception Styles & Tight Coupling**: Some domain services (`orders`, `quotes`, `catalog`) injected `I18nService<I18nTranslations>` into service constructors and manually called `this.i18n.t(key)` before throwing exceptions. Other services (`cart`, `leads`, `warehouse`, `dealer-tiers`) threw raw hardcoded English strings (e.g. `throw new BadRequestException("Product is out of stock")`).
2. **Loss of Machine-Readable Error Codes**: When services translated errors into static strings prior to throwing, the API response lost the originating error code. Frontend clients (`storefront` and `admin`) received localized text without a persistent `code` identifier, preventing automated UI logic branching (such as opening replenishment dialogs or specific form field focus).
3. **The GlobalExceptionFilter Translation Gap**: `GlobalExceptionFilter` lines 218–221 returned string `res["message"]` directly without translation unless passed in a custom pipe format `key|{args}`. Throwing raw keys (e.g. `catalog.PRODUCT_NOT_FOUND`) resulted in unlocalized keys reaching clients.
4. **Developer Experience (DX) & Type-Safety Deficit**: Throwing standard NestJS exception objects (e.g. `new BadRequestException({ message: "cart.OUT_OF_STOCK" })`) provided zero IDE autocomplete and no compile-time type checking for translation keys or required interpolation parameters. Typographical errors in keys went undetected until runtime.
5. **Client Header Omission**: Next.js applications (`storefront` and `admin`) did not forward the active locale cookie (`NEXT_LOCALE`) as an `Accept-Language` header to backend requests, causing all backend responses to default to Vietnamese.

---

## Decision

We establish a unified, type-safe, centralized error handling and localization architecture comprising four foundational pillars:

### 1. Centralized Filter-Level Translation (RFC 9457 Problem Details)

Domain services MUST NOT translate exceptions at the service layer and MUST NOT inject `I18nService`. Instead, `GlobalExceptionFilter` serves as the single source of truth for error localization:

- Extracts the request's resolved language via `I18nContext.current(host)?.lang`.
- Automatically detects canonical i18n keys matching `/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/`.
- Translates keys using `I18nService.translate` with dynamic interpolation arguments (`args`).
- Populates standard RFC 9457 fields: `type`, `title`, `status`, `detail`, `instance`, `invalidParams`, `timestamp`.

### 2. Canonical Namespaced Error Codes (`module.KEY`)

All API error responses include a machine-readable `code` field matching the exact namespaced translation key:

- Domain Errors: `"code": "cart.OUT_OF_STOCK"`, `"code": "catalog.PRODUCT_NOT_FOUND"`, `"code": "cart.STOCK_EXCEEDED"`.
- Database & Concurrency Collisions: `"code": "common.RESOURCE_CONFLICT"` (PostgreSQL 23505, 23P01, 40P01 $\rightarrow$ HTTP 409).
- Query Timeouts: `"code": "common.GATEWAY_TIMEOUT"` (PostgreSQL 57014 $\rightarrow$ HTTP 504).
- Syntax Errors: `"code": "validation.isUuid"` (PostgreSQL 22P02 $\rightarrow$ HTTP 400).
- System Fallbacks: `"code": "common.INTERNAL_SERVER_ERROR"` (HTTP 500).
- DTO Validation Errors: `"code": "common.INVALID_INPUT"` (HTTP 400).

This allows frontend clients (`next-intl`) to look up translations via `t(error.code)` with zero string parsing or regex transformations.

### 3. Typed I18n HTTP Exceptions (`@/common/exceptions`)

We introduce typed exception wrappers in `backend/src/common/exceptions/i18n.exception.ts` extending standard NestJS HTTP exceptions:

- `I18nBadRequestException`
- `I18nNotFoundException`
- `I18nConflictException`
- `I18nForbiddenException`
- `I18nUnauthorizedException`
- `I18nUnprocessableEntityException`

Each typed exception accepts `keyOrPayload: I18nPath | I18nExceptionPayload` and optional `args?: Record<string, unknown>`.

```typescript
// IDE provides 100% autocomplete from i18n.generated.ts
throw new I18nNotFoundException("cart.ITEM_NOT_FOUND", { id: itemId });

// Compile-time error on misspelled keys:
// ❌ Argument of type '"cart.OUT_OF_STOK"' is not assignable to parameter of type 'I18nPath'
throw new I18nBadRequestException("cart.OUT_OF_STOK");
```

Because these classes extend standard NestJS exceptions, `instanceof BadRequestException` checks and existing unit test assertions (`expect(promise).rejects.toThrow(BadRequestException)`) continue to pass without modification.

### 4. End-to-End Client Locale Forwarding

Both `admin/src/lib/api-client.ts` and `storefront/src/lib/api-client.ts` intercept outbound requests and inject the `Accept-Language` header from the active `NEXT_LOCALE` cookie. On `storefront`, cookie access is strictly bypassed for public catalog routes to guarantee compatibility with Next.js 16 `"use cache"`.

---

## Consequences

- **100% Compile-Time Type Safety**: Misspelled translation keys and invalid paths are caught by the TypeScript compiler before reaching runtime.
- **Zero Unit Test Mocking Overhead**: Domain services no longer inject `I18nService`. Unit tests do not need to construct mock translation providers, keeping service tests focused solely on business logic.
- **RFC 9457 Full Compliance with Dual-Consumption**: API consumers receive both a human-readable localized `detail` (ready for immediate display) and a stable, machine-readable `code` (ready for automated UI branching).
- **Clean Polyrepo & Standalone Portability**: Services remain pure domain orchestrators, decoupling localization infrastructure from core business workflows.

### Explicit Tradeoffs

- **Centralized Filter Translation vs Local Service Context**:
  - _Tradeoff_: Translating in the filter prevents services from inspecting the final translated string for internal logging.
  - _Mitigation_: Logging inside services should record domain parameters and structured entity IDs, not customer-facing localized strings. Sentry and Pino capture the full RFC 9457 error payload at the filter layer.
- **Namespaced Dot-Notation (`cart.OUT_OF_STOCK`) vs Flat UPPER_SNAKE_CASE (`CART_OUT_OF_STOCK`)**:
  - _Tradeoff_: Some external API consumers prefer flat uppercase strings without dots.
  - _Mitigation_: Dot-notation maps 1:1 to frontend `next-intl` dictionary namespaces (`t("cart.OUT_OF_STOCK")`) with zero translation overhead. RFC 9457 permits arbitrary string extension members. Explicit custom codes passed via `{ code: "CUSTOM" }` are preserved.
- **Backend-Localized `detail` vs Pure Frontend Translation**:
  - _Tradeoff_: Maintaining translation dictionaries on both backend (error messages) and frontend (UI labels) introduces dual dictionary management.
  - _Mitigation_: Backend dictionaries serve as the authoritative system of record for domain-level error messages, ensuring CLI tools, third-party webhook integrations, and admin dashboards receive readable text even if frontend dictionaries lack an updated key.
