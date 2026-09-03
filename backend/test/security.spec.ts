import { describe, expect, it } from "bun:test";
import { comparePassword, hashPassword } from "@/common/utils/crypto.util";
import { sanitizeString } from "@/common/utils/sanitize.util";

describe("Security Controls", () => {
  describe("Password Hashing (Scrypt)", () => {
    it("should successfully hash and verify a correct password", async () => {
      const password = "mySecurePassword123!";
      const hash = await hashPassword(password);

      expect(hash).toContain(":");
      expect(await comparePassword(password, hash)).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "mySecurePassword123!";
      const wrongPassword = "wrongPassword123!";
      const hash = await hashPassword(password);

      expect(await comparePassword(wrongPassword, hash)).toBe(false);
    });

    it("should fail gracefully for malformed hash strings", async () => {
      expect(await comparePassword("password", "malformed_hash_no_colon")).toBe(
        false,
      );
      expect(await comparePassword("password", "")).toBe(false);
    });
  });

  describe("XSS Sanitization (Stored XSS Prevention)", () => {
    it("should strip simple <script> tags", () => {
      const input = "<script>alert('XSS')</script>";
      const sanitized = sanitizeString(input);
      expect(sanitized).toBe("");
    });

    it("should completely strip self-closing tags with event handlers", () => {
      const input = "<img src=x onerror=alert('XSS')>";
      const sanitized = sanitizeString(input);
      expect(sanitized).toBe("");
    });

    it("should handle mixed HTML and plain text safely", () => {
      const input = "Hello <script>alert(1)</script> World";
      const sanitized = sanitizeString(input);
      expect(sanitized).toBe("Hello  World");
    });

    it("should return non-string values as-is without crashing", () => {
      expect(sanitizeString(123)).toBe(123);
      expect(sanitizeString(null)).toBeNull();
      expect(sanitizeString(undefined)).toBeUndefined();
    });

    it("should NOT modify non-tag XSS payloads like javascript: URIs (boundary verification)", () => {
      // Boundary Check: since it doesn't contain HTML tags (< or >),
      // sanitizeString will not strip it. This must be handled by URL validation or frontend escaping.
      const input = "javascript:alert('XSS')";
      expect(sanitizeString(input)).toBe("javascript:alert('XSS')");
    });

    it("should NOT modify attribute injection payloads (boundary verification)", () => {
      // Boundary Check: quotes used to break out of attributes do not contain HTML tags.
      // This must be handled by HTML escaping at the template/frontend level.
      const input = '" autofocus onfocus="alert(1)';
      expect(sanitizeString(input)).toBe('" autofocus onfocus="alert(1)');
    });

    it("should successfully sanitize unclosed HTML tags using production-grade sanitizer", () => {
      // With sanitize-html, unclosed tags are correctly identified and stripped, preventing the vulnerability!
      const input = "<script src=http://attacker.com/xss.js";
      const sanitized = sanitizeString(input);

      expect(sanitized).toBe("");
    });
  });
});
