# 7. Selection of Node.js Native Scrypt for Password Hashing

Date: 2026-07-28
Deciders: Team / Core Security

### Metadata

- **ID**: `ADR-0007`
- **Status**: `Accepted`
- **Date**: `2026-07-28`
- **Feature**: `auth`
- **Topic**: `Password Hashing Algorithm Selection (Node.js Native Scrypt vs Bcrypt / Argon2)`
- **Target Module**: `src/modules/auth/` & `src/common/crypto/`

---

## Status

Accepted

---

## Context

The authentication system requires a secure password hashing mechanism to protect user credentials against brute-force attacks and hardware-accelerated dictionary attacks (GPU/ASIC).

Common choices include `bcrypt`, `argon2`, and Node.js native `crypto.scrypt`. Selecting an external library (`bcrypt` or `argon2`) introduces native C++ compilation dependencies (`node-gyp`), which often fail in minimal Docker containers (`node:alpine`) or lightweight CI/CD build environments due to missing build tools (`python`, `g++`, `make`).

---

## Considered Options

- **Option A (Chosen)**: Node.js Native `crypto.scrypt` (`N: 16384, r: 8, p: 1`) — _Chosen for zero native C++ npm dependencies, memory-hard ASIC resistance, and robust cross-platform container execution_
- **Option B**: NPM `bcrypt` — _Rejected due to C++ addon build failures in Alpine Docker images and GPU vulnerability compared to memory-hard algorithms_
- **Option C**: NPM `argon2` — _Rejected due to build-time dependency complexity despite top-tier cryptographic properties_

---

## Decision Outcome

Chosen Option: **Option A**.

We adopt Node.js native `crypto.scrypt` with `timingSafeEqual` comparison. This provides memory-hard password protection against ASIC/GPU cracking while guaranteeing 100% build reliability without additional npm binary dependencies.

---

## Consequences

### Positive Consequences

- **Zero Build Failures**: Eliminates `node-gyp` and Python/g++ dependency requirements in Docker and CI/CD.
- **Supply Chain Security**: Reduces package.json footprint and eliminates potential third-party package security risks.
- **ASIC/GPU Resistance**: Memory-hard key derivation function prevents mass parallel GPU dictionary attacks.

### Negative Consequences

- Requires manual implementation of salt generation and `timingSafeEqual` comparison logic instead of single-line helper functions.

### Explicit Tradeoffs

- **Developer Convenience vs Supply Chain & Build Zero-Defects**: Sacrificing the single-line convenience of `bcrypt.hash()` for standard Node.js `crypto.scrypt` + `timingSafeEqual` boilerplate in exchange for 0 build failures and 0 external npm dependencies.
- **Peak Cryptographic Customizability vs Native Availability**: Choosing native `scrypt` over Argon2id trades off multi-threading tuning parameters for instant Node.js core availability.

---

## Decision Drivers

- **Build Reliability**: Guarantee instant, error-free container builds across Linux/Alpine/macOS environments.
- **Security & Privacy**: Provide memory-hard password protection resisting hardware brute-force attacks.
- **Supply Chain Security**: Keep third-party npm dependencies to a minimum.

---

## Validation & Verification

- `bun test test/auth.e2e-spec.ts` verifies password hashing and timing-safe verification logic.

---

## Metadata & References

- **Original Location**: `second-brain/Docs/Auth/Password_Hashing_Scrypt_vs_Bcrypt_Argon2.md`
