# 8. Refresh Token Separation into Dedicated Table Strategy

Date: 2026-07-04
Deciders: Team / Core Security

### Metadata

- **ID**: `ADR-0008`
- **Status**: `Accepted`
- **Date**: `2026-07-04`
- **Feature**: `auth`
- **Topic**: `Refresh Token Separation into Dedicated Table Strategy (Multi-Device Sessions & RTR)`
- **Target Module**: `src/modules/auth/` & `src/database/schemas/`

---

## Status

Accepted

---

## Context

Initially, user refresh tokens were planned as a single `refreshTokenHash` column directly within the `users` table to keep schema design simple.

As system requirements grew, storing a single token in the `users` row caused severe functional and security constraints:

1. **Single-Session Limitation**: Logging in on a mobile phone overwrote the token hash, logging the user out of their desktop browser.
2. **Lack of Granular Revocation**: Users could not revoke a lost laptop session without terminating all active sessions.
3. **Database Lock Contention**: Every token refresh executed an `UPDATE users` statement, locking the user's primary profile row during active seat reservations.
4. **Incompatibility with Refresh Token Rotation (RTR)**: Detecting token reuse attacks requires historical tracking or revoked token markers impossible within a single column.

---

## Considered Options

- **Option A (Chosen)**: Separate `refresh_tokens` Table (`1:N` Relationship) with SHA-256 Hashed Tokens — _Chosen to support multi-device sessions, granular session revocation, zero DB lock contention on user profile, and Refresh Token Rotation (RTR)_
- **Option B**: Single `refreshTokenHash` Column in `users` Table — _Rejected due to single-session lockouts and high DB lock contention on user profile updates_
- **Option C**: Pure In-Memory Redis Session Store Only — _Rejected due to persistence requirements for long-lived session audit trails and device metadata_

---

## Decision Outcome

Chosen Option: **Option A**.

We separate refresh token storage into a dedicated `refresh_tokens` table. Tokens are stored strictly as SHA-256 hashes (`token_hash`) linked via foreign key to `users.id`, with device metadata and revocation tracking (`is_revoked`).

---

## Consequences

### Positive Consequences

- **Multi-Device Support**: Users remain logged in seamlessly across mobile, desktop, and web applications.
- **Granular Session Revocation**: Users or admins can revoke specific compromised device sessions independently.
- **Reduced Lock Contention**: Updating/deleting a token row isolates locks to the `refresh_tokens` table, keeping the primary `users` row unlocked for booking operations.
- **RTR Security**: Enables Refresh Token Rotation with automatic reuse detection (invalidating all sessions if a revoked token is presented).

### Negative Consequences

- Requires maintaining an additional database table and running periodic background cleanup jobs for expired token rows.

### Explicit Tradeoffs

- **Schema Complexity vs Multi-Device & Lock Isolation**: Sacrificing 1-table simplicity to introduce `refresh_tokens` table to prevent user profile row locking during token refresh calls.
- **DB Storage Footprint vs Audit Trail**: Storing hashed tokens with IP and device metadata takes disk space but provides complete session auditability and security revocation controls.

---

## Decision Drivers

- **Security & Threat Mitigation**: Enable Refresh Token Rotation (RTR) and token reuse detection.
- **User Experience**: Support simultaneous logins across multiple devices.
- **Performance**: Eliminate DB lock contention on the main `users` table during token refresh calls.

---

## Validation & Verification

- Verified via `POST /api/auth/login`, `POST /api/auth/refresh`, and `POST /api/auth/logout` integration tests.

---

## Metadata & References

- **Original Location**: `second-brain/Docs/Auth/Refresh_Token_Separation_Strategy.md`
