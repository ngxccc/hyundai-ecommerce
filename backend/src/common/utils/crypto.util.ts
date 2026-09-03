import type { ScryptOptions } from "node:crypto";
import {
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { env } from "@/env";

const scryptAsync = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

// Use ultra-lightweight scrypt parameters (N=128, r=1, p=1) in test environment to reduce CPU hashing overhead to microseconds while preserving exact functional verification.
const SCRYPT_OPTIONS: ScryptOptions =
  env.NODE_ENV === "test" ? { N: 128, r: 1, p: 1 } : { N: 16384, r: 8, p: 1 };

const KEY_LENGTH_BYTES = 64;
const SALT_BYTES = 16;

/**
 * Derives a cryptographic key from a password and salt using scrypt.
 */
function deriveKey(password: string, salt: string): Promise<Buffer> {
  return scryptAsync(password, salt, KEY_LENGTH_BYTES, SCRYPT_OPTIONS);
}

/**
 * Generates a salted scrypt hash for a plaintext password.
 *
 * @param password Plaintext password to hash
 * @returns Colon-delimited salt and hex-encoded derived key
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = await deriveKey(password, salt);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Validates a plaintext password against a stored colon-delimited hash using timing-safe comparison.
 *
 * @param password Plaintext password to verify
 * @param storedHash Colon-delimited salt and hex-encoded hash string
 * @returns true if password matches hash; otherwise false
 */
export async function comparePassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  // Split limit of 2 guards against colons inside a base-encoded key segment producing extra parts.
  const [salt, key] = storedHash.split(":", 2);
  if (!salt || !key) {
    return false;
  }
  const derivedKey = await deriveKey(password, salt);
  const keyBuffer = Buffer.from(key, "hex");

  // timingSafeEqual throws on length mismatch — guard prevents an uncaught TypeError.
  if (derivedKey.length !== keyBuffer.length) {
    return false;
  }

  // Timing-safe comparison prevents timing-attack inference of the correct hash length.
  return timingSafeEqual(derivedKey, keyBuffer);
}

/**
 * Computes deterministic SHA-256 hex digest for a string value.
 *
 * @param value Input string
 * @returns 64-character lowercase hex digest
 */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
