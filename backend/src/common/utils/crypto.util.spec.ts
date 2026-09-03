import { describe, expect, it } from "bun:test";
import { hashPassword, comparePassword, sha256 } from "./crypto.util";

describe("Crypto Utilities", () => {
  describe("hashPassword and comparePassword", () => {
    it("should return salt and scrypt key string when hashing password", async () => {
      const hash = await hashPassword("my-secret-password");

      expect(typeof hash).toBe("string");
      expect(hash).toContain(":");
      const [salt, key] = hash.split(":");
      expect(salt?.length).toBe(32);
      expect(key?.length).toBe(128);
    });

    it("should return true when password matches the stored hash", async () => {
      const password = "correct-password";
      const hash = await hashPassword(password);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it("should return false when password does not match the stored hash", async () => {
      const hash = await hashPassword("correct-password");

      const isMatch = await comparePassword("wrong-password", hash);
      expect(isMatch).toBe(false);
    });

    it("should return false when stored hash is malformed without salt or key", async () => {
      expect(await comparePassword("password", "")).toBe(false);
      expect(await comparePassword("password", "onlysalt")).toBe(false);
      expect(await comparePassword("password", ":onlykey")).toBe(false);
      expect(await comparePassword("password", "salt:")).toBe(false);
    });

    it("should return false when stored hash key length does not match derived key length", async () => {
      const hash = "1234567890abcdef:shortkey";
      const isMatch = await comparePassword("password", hash);
      expect(isMatch).toBe(false);
    });
  });

  describe("sha256", () => {
    it("should return deterministic hex hash when sha256 is called", () => {
      const input = "test-string";
      const hash1 = sha256(input);
      const hash2 = sha256(input);

      expect(hash1).toBe(hash2);
      expect(hash1).toBe(
        "ffe65f1d98fafedea3514adc956c8ada5980c6c5d2552fd61f48401aefd5c00e",
      );
    });
  });
});
