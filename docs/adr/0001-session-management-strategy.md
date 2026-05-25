# 1. Session Management Strategy

Date: 2026-05-25

## Status

Accepted

## Context

We need to decide on a canonical pattern for managing and consuming user session state across Next.js Server Components and Client Components in our turborepo (`apps/storefront` and `apps/admin`).
Authentication is powered by **Better Auth**. There was a proposal to use `Zustand` to fetch, store, and manage the user's session globally in the browser to avoid repetitive API calls.

However, session state is inherently a server-driven state (backed by HTTP-only cookies). Storing it in a pure client-side store like Zustand introduces several problems:

1. **Source of Truth Duplication**: The cookie is the real source of truth, but Zustand introduces a parallel, potentially stale copy.
2. **Cross-Tab Syncing**: Manual event listeners must be written to detect login/logout events from other tabs.
3. **FOUC**: Initializing Zustand requires the component to mount first, causing a flash of unauthenticated content.

## Decision

We will **NOT** use Zustand (or Redux/Context) to manage global session state.
Instead, we will rely exclusively on the built-in patterns provided by Better Auth and Next.js:

1. **For Route Protection**: Use Next.js Middleware (`proxy.ts` / `middleware.ts`) calling Better Auth's `/api/auth/get-session` endpoint at the Edge before rendering begins.
2. **For Server Components**: Directly use `auth.api.getSession({ headers })` to read from the incoming request. This executes securely on the server with zero JavaScript shipped to the client.
3. **For Client Components**: Use Better Auth's `authClient.useSession()` hook. This hook handles fetching, caching, loading states, and cross-tab synchronization automatically under the hood without the need for manual global state management.

Zustand will be strictly reserved for pure client-side ephemeral state (e.g., UI toggles, temporary un-submitted form data, or complex client-side interactions).

## Consequences

- **Positive**: Clean architectural boundaries between server-driven state (Auth) and client-driven state (UI).
- **Positive**: No manual cross-tab syncing code required.
- **Positive**: Eliminates FOUC during protected route rendering.
- **Negative**: Client components deep in the tree that need session data must call `useSession()`, but since the hook caches aggressively, the performance impact is negligible.
