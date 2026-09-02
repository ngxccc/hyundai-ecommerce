# Security & Cryptography Standards

## 1. Password Hashing & Verification (Scrypt)

- **Algorithm**: MUST use Node/Bun native `crypto.scrypt`.
- **Recommended Parameters**:
  - Memory cost $N = 16384$ ($2^{14}$)
  - Block size $r = 8$
  - Parallelization $p = 1$
  - Key length = $64\text{ bytes}$
  - Salt length = $16\text{ bytes}$ (cryptographically secure random salt per user).
- **Stored Hash Format**: `salt:derivedKey` (Hex encoded).

---

## 2. Constant-Time Comparison (Timing Attack Defense)

When verifying passwords, HMAC signatures, or token hashes:

- **RULE**: NEVER use standard equality operators (`===` or `==`).
- **MANDATORY**: MUST use `crypto.timingSafeEqual` with strict length guards:

```ts
export async function comparePassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [salt, key] = storedHash.split(":", 2);
  if (!salt || !key) return false;

  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");

  // Length mismatch guard prevents timingSafeEqual TypeError
  if (derivedKey.length !== keyBuffer.length) return false;

  return timingSafeEqual(derivedKey, keyBuffer);
}
```

---

## 3. JWT & Refresh Token Lifecycle

- **Access Token**: Short-lived (15 minutes), stateless JWT stored in client memory.
- **Refresh Token**: Long-lived (7 days), stored in PostgreSQL as SHA-256 hash.
- **Single-Use Rotation**: Using a refresh token immediately invalidates it and issues a new token pair.
- **Global Session Revocation**: Changing passwords, resetting credentials, or calling `/auth/logout-all` physically deletes all active refresh tokens from the database.

---

## 4. XSS Sanitization & Input Whitelisting

- **Zod Schema Parsing & Stripping**: Use Zod validators (`packages/database/src/validators/`) to strip unknown keys and enforce strict type contracts on all inputs.
- **Sanitize HTML**: Strip all `<script>` tags, event handlers (`onerror`, `onload`), and dangerous protocols (`javascript:`) before persisting text/markdown fields.

---

## 5. Webhook Signature Verification & Anti-Replay Protection

- **HMAC-SHA256 Verification (PayOS)**: Verify raw body against PayOS checksum keys using sorted key canonicalization (`verifyPayOSSignature` in `packages/shared/src/lib/payos.ts`).
- **Anti-Replay Protection**: Validate transaction timestamps and store processed PayOS transaction IDs with Redis/DB uniqueness to eliminate duplicate executions.
---

## 6. Protection Against User Enumeration

- Public endpoints (`/api/auth/forgot-password`, `/api/auth/verify-email`) MUST return a generic `200 OK` success response even if the email does not exist in the database.
