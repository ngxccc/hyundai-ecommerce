# 2. Pure Service Architecture for Client Authentication

Date: 2026-05-25

## Status

Accepted

## Context

We needed a standardized way to interact with Better Auth's client-side SDK (`authClient`) within our frontend applications (`apps/storefront`, `apps/admin`).
Specifically, when a user logs in, we need to call `authClient.signIn.email`, catch any errors thrown by the SDK, map them to our internal domain error codes, and present them via the UI.

We evaluated three approaches to abstracting the `authClient`:

1. **Inline Usage**: Call `authClient.signIn.email` directly inside our React Form components.
2. **Custom React Hook**: Wrap the logic inside a custom hook (e.g., `useAuthActions`) that encapsulates the SDK calls and Next-Intl translations.
3. **Pure TypeScript Service**: Wrap the SDK calls inside a framework-agnostic TypeScript class (`AuthClientService`) that mirrors the backend service layer.

## Decision

We chose **Option 3: Pure TypeScript Service**.

We created `AuthService` inside `packages/database/src/services/auth.services.ts`.
This service implements the exact same `IAuthService` interface used by the backend `AuthService`. It is responsible for:

- Executing the client-side authentication requests via `authClient`.
- Catching 3rd-party specific error codes (e.g., Better Auth's `INVALID_EMAIL_OR_PASSWORD`).
- Normalizing them into our canonical system error codes (e.g., `INVALID_CREDENTIALS`).
- Returning a standardized `TAuthActionResult` object.

React components (like `AdminLoginForm`) will import this pure service to execute business logic. The components are strictly relegated to the "View" layer—handling UI states (loading spinners), translating the canonical error codes into human-readable strings via `next-intl`, and triggering toast notifications.

## Consequences

- **Positive (Decoupling)**: Business logic is decoupled from React. If we ever migrate to Vue, Svelte, or build a React Native mobile app, `AuthService` can be reused without modification.
- **Positive (Symmetry)**: The Client and Server share the identical `IAuthService` contract, creating a highly symmetrical and predictable monorepo architecture.
- **Positive (Thin Views)**: UI Components remain thin and focused exclusively on rendering and data binding.
- **Negative (Boilerplate)**: Requires writing a slight amount of boilerplate (the service class and mapping functions) compared to just calling the SDK inline.

### Explicit Tradeoffs

- **Framework Decoupling vs. Inline SDK Simplicity**: We trade writing a boilerplate service wrapper class for decoupling authentication logic from React, allowing reuse in non-React environments but adding minor codebase overhead.
- **Normalized Canonical Errors vs. Native SDK Errors**: We trade direct native SDK error handling in UI components for normalizing them in a service layer, keeping UI code thin but requiring mapping logic.
