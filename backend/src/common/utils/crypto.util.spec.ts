import { describe, expect, test } from "bun:test";
import { hashPassword, comparePassword, sha256 } from "./crypto.util";

describe("Crypto Utilities", () => {
  describe("hashPassword()", () => {
    describe("when hashing a plaintext password", () => {
      test("should return colon-delimited salt and 128-character hex derived key", async () => {
        const hash = await hashPassword("my-secret-password");

        expect(typeof hash).toBe("string");
        expect(hash).toContain(":");
        const [salt, key] = hash.split(":");
        expect(salt?.length).toBe(32); // 16 bytes = 32 hex chars
        expect(key?.length).toBe(128); // 64 bytes = 128 hex chars
      });

      test("should produce unique salts for identical passwords", async () => {
        const password = "same-password";
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);

        expect(hash1).not.toBe(hash2);
        const [salt1] = hash1.split(":");
        const [salt2] = hash2.split(":");
        expect(salt1).not.toBe(salt2);
      });
    });
  });

  describe("comparePassword()", () => {
    describe("when password matches the stored hash", () => {
      test("should return true using constant-time comparison", async () => {
        const password = "correct-password";
        const hash = await hashPassword(password);

        const isMatch = await comparePassword(password, hash);
        expect(isMatch).toBe(true);
      });
    });

    describe("when password does not match the stored hash", () => {
      test("should return false", async () => {
        const hash = await hashPassword("correct-password");

        const isMatch = await comparePassword("wrong-password", hash);
        expect(isMatch).toBe(false);
      });
    });

    describe("when stored hash is malformed or invalid length", () => {
      test("should return false safely without throwing errors", async () => {
        expect(await comparePassword("password", "")).toBe(false);
        expect(await comparePassword("password", "onlysalt")).toBe(false);
        expect(await comparePassword("password", ":onlykey")).toBe(false);
        expect(await comparePassword("password", "salt:")).toBe(false);

        const shortKeyHash = "1234567890abcdef1234567890abcdef:shortkey";
        expect(await comparePassword("password", shortKeyHash)).toBe(false);
      });
    });
  });

  describe("sha256()", () => {
    describe("when computing deterministic digest", () => {
      test("should return 64-character lowercase hex digest", () => {
        const input = "test-string";
        const hash1 = sha256(input);
        const hash2 = sha256(input);

        expect(hash1).toBe(hash2);
        expect(hash1).toBe(
          "ffe65f1d98fafedea3514adc956c8ada5980c6c5d2552fd61f48401aefd5c00e",
        );
        expect(hash1.length).toBe(64);
      });
    });
  });
});
