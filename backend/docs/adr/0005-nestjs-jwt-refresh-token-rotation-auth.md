# 5. NestJS Custom JWT Authentication with Refresh Token Rotation and Secure Cookie Storage

Date: 2026-09-12

## Status

Accepted (Supersedes preliminary Better Auth designs)

## Context

During early planning stages and in historical external knowledge-base notes, Better Auth was explored as a candidate authentication framework.

When evaluated against the decoupled, polyrepo-ready architecture of this enterprise platform (independent NestJS 11 REST API backend and independent Next.js 16 backoffice admin and customer storefront applications), Better Auth introduced critical architectural friction:

1. **Monolithic Framework Coupling**:
   - Better Auth is heavily optimized for Next.js full-stack runtimes with built-in route handlers and edge middleware. Fitting it into a standalone NestJS micro-framework required awkward proxying and compromised NestJS's dependency injection lifecycle.
2. **Schema & ORM Redundancy**:
   - Better Auth imposes its own opinionated user and session database schema tables and query layer. This conflicted with our canonical Drizzle ORM PostgreSQL schema (`users`, `refreshTokens`, `dealerTiers`), creating schema drift and dual migration maintenance.
3. **Impaired RBAC & Guard Synergy**:
   - NestJS utilizes standard decorator-driven metadata reflection (`@Roles(Role.ADMIN, Role.SALES)`) paired with execution context guards (`JwtAuthGuard`, `RolesGuard`). Third-party session wrappers obstructed clean, stateless token extraction and fine-grained role evaluation.

---

## Decision

We permanently eliminate Better Auth from all packages and implement an **enterprise-grade, hand-rolled NestJS Authentication and Authorization System** residing directly in `backend/src/modules/auth/`:

### 1. Dual-Token Architecture with Stateless Access Tokens

- **Access Token**:
  - Signed using `@nestjs/jwt` with a standard symmetric `JWT_SECRET`.
  - Stateless payload: `{ sub: user.id, email: user.email, role: user.role }`.
  - Short-lived TTL (configured via `JWT_ACCESS_EXPIRES_IN`, typically 15 minutes to 24 hours).
  - Verified statelessly on every protected route via `JwtAuthGuard` without querying the database.

### 2. Opaque Refresh Tokens with SHA-256 Hashing

- **Refresh Token Generation**:
  - Refresh tokens are cryptographically secure 32-byte random hexadecimal strings generated via Node.js native crypto:
    ```typescript
    const rawToken = crypto.randomBytes(32).toString("hex");
    ```
- **Hashed Database Persistence**:
  - The plaintext token is returned to the client once. The database `refresh_tokens` table stores ONLY the one-way **SHA-256 hash** of the token:
    ```typescript
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    ```
  - Even in the event of an unauthorized database snapshot read, attackers cannot forge valid refresh requests.

### 3. Strict Rotate-on-Use (RTR) Mechanism

- Every valid invocation of `POST /api/v1/auth/refresh` immediately revokes the presented refresh token by deleting or invalidating its record.
- A brand new access token and a brand new refresh token are generated, hashed, and returned in atomic execution.
- If an invalidated token is reused, the auth system flags a potential replay breach and rejects the request.

### 4. Scheduled Garbage Collection (`TokenCleanupService`)

- A dedicated bootstrap cron service (`TokenCleanupService`) runs periodic scheduled sweeps against PostgreSQL:
  ```typescript
  await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
  ```
- This prevents unbounded row growth in the `refresh_tokens` table.

### 5. Client Security & Transparent Silent Refresh in Admin CMS

- The Admin backoffice (`admin/src/lib/api-client.ts`) stores credentials in secure browser cookies:
  - `adminAccessToken`: Cookie configured with `HttpOnly`, `SameSite=Lax`, and `Secure` (in production).
  - `adminRefreshToken`: Cookie configured with `HttpOnly`, `SameSite=Lax`, and `Secure` (in production).
  - `adminUser`: Non-HttpOnly JSON cookie containing non-sensitive identity metadata (`{ id, email, fullName, role }`) for UI header hydration.
- The Admin API client middleware automatically decodes the JWT expiration timestamp. If the access token expires in less than 60 seconds, it initiates a transparent, non-blocking refresh call before dispatching the upstream API request.

---

## Consequences & Trade-offs

### Positive

- **Zero Third-Party Vendor Lock-in**: Full control over token lifecycles, hashing algorithms, and session revocation.
- **Unified Drizzle ORM Schema**: All user identity, authentication, role, and credential entities live inside the primary database schema.
- **Native NestJS Guard Ergonomics**: `JwtAuthGuard` and `RolesGuard` operate seamlessly without intermediate session translation layers.
- **Robust Attack Resistance**: Plaintext refresh tokens never reside in PostgreSQL; single-use rotation halts replay vectors.

### Negative & Mitigations

- **In-House Maintenance**: Password hashing (`bcrypt`), rate-limiting, and token rotation logic must be maintained and tested by the team.
  - _Mitigation_: Rigorously covered by automated integration test suites and hardened against OWASP standards.
