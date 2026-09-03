import { describe, expect, it } from "bun:test";
import {
  zBooleanString,
  zEmail,
  zNumericString,
  zPassword,
  zPhoneNumber,
  zSanitizedString,
  zUuidV7,
} from "./zod-primitives";

describe("Zod Primitives Specification", () => {
  describe("zSanitizedString", () => {
    it("should strip HTML tags and trim whitespace when valid string is provided", () => {
      const schema = zSanitizedString();
      const result = schema.safeParse(
        "  <b>Hello</b> <script>alert('xss')</script> World  ",
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("Hello World");
      }
    });

    it("should reject non-string inputs when type is invalid", () => {
      const schema = zSanitizedString();
      const result = schema.safeParse(12345);

      expect(result.success).toBe(false);
    });

    it("should enforce min and max constraints when specified", () => {
      const schema = zSanitizedString({ min: 3, max: 10 });

      expect(schema.safeParse("ab").success).toBe(false);
      expect(schema.safeParse("abc").success).toBe(true);
      expect(schema.safeParse("1234567890").success).toBe(true);
      expect(schema.safeParse("12345678901").success).toBe(false);
    });
  });

  describe("zEmail", () => {
    it("should normalize email to lowercase and trim spaces when valid email is provided", () => {
      const schema = zEmail();
      const result = schema.safeParse("  User.Name+Tag@Example.COM  ");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("user.name+tag@example.com");
      }
    });

    it("should reject malformed email strings when format is invalid", () => {
      const schema = zEmail();

      expect(schema.safeParse("plainaddress").success).toBe(false);
      expect(schema.safeParse("@missingusername.com").success).toBe(false);
      expect(schema.safeParse("username@.com").success).toBe(false);
      expect(schema.safeParse("").success).toBe(false);
    });
  });

  describe("zPassword", () => {
    it("should accept strong passwords meeting all complexity requirements", () => {
      const schema = zPassword();
      const result = schema.safeParse("StrongP@ss123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("StrongP@ss123");
      }
    });

    it("should reject passwords under 8 characters when length is insufficient", () => {
      const schema = zPassword();
      const result = schema.safeParse("P@1a");

      expect(result.success).toBe(false);
    });

    it("should reject passwords missing uppercase letters when required", () => {
      const schema = zPassword();
      const result = schema.safeParse("password123!");

      expect(result.success).toBe(false);
    });

    it("should reject passwords missing numeric digits when required", () => {
      const schema = zPassword();
      const result = schema.safeParse("Password!@#");

      expect(result.success).toBe(false);
    });

    it("should reject passwords missing special characters when required", () => {
      const schema = zPassword();
      const result = schema.safeParse("Password1234");

      expect(result.success).toBe(false);
    });
  });

  describe("zPhoneNumber", () => {
    it("should accept valid 10-digit Vietnamese mobile phone numbers", () => {
      const schema = zPhoneNumber();

      const validNumbers = [
        "0912345678",
        "0812345678",
        "0712345678",
        "0512345678",
        "0312345678",
      ];

      for (const phone of validNumbers) {
        const result = schema.safeParse(phone);
        expect(result.success).toBe(true);
      }
    });

    it("should reject phone numbers with invalid carrier prefixes or wrong lengths", () => {
      const schema = zPhoneNumber();

      expect(schema.safeParse("0123456789").success).toBe(false); // Invalid prefix 01
      expect(schema.safeParse("0212345678").success).toBe(false); // Invalid prefix 02
      expect(schema.safeParse("091234567").success).toBe(false); // 9 digits
      expect(schema.safeParse("09123456789").success).toBe(false); // 11 digits
      expect(schema.safeParse("091234567a").success).toBe(false); // Alpha characters
    });
  });

  describe("zUuidV7", () => {
    it("should accept valid RFC 9562 UUIDv7 identifiers", () => {
      const schema = zUuidV7();
      const validUuidV7 = "019fa8bc-8f4d-7000-b366-e691f45cfb8f";
      const result = schema.safeParse(validUuidV7);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuidV7);
      }
    });

    it("should reject invalid UUID format strings", () => {
      const schema = zUuidV7();

      expect(schema.safeParse("not-a-valid-uuid").success).toBe(false);
      expect(
        schema.safeParse("019fa8bc-8f4d-8000-b366-e691f45cfb8f").success,
      ).toBe(false); // Version 8 not 7
      expect(schema.safeParse("").success).toBe(false);
    });
  });

  describe("zBooleanString", () => {
    it("should parse boolean and string representations of true and false cleanly", () => {
      const schema = zBooleanString();

      expect(schema.safeParse(true).data).toBe(true);
      expect(schema.safeParse("true").data).toBe(true);
      expect(schema.safeParse(false).data).toBe(false);
      expect(schema.safeParse("false").data).toBe(false);
    });

    it("should reject arbitrary strings that are not exact boolean literals", () => {
      const schema = zBooleanString();

      expect(schema.safeParse("yes").success).toBe(false);
      expect(schema.safeParse("1").success).toBe(false);
      expect(schema.safeParse("0").success).toBe(false);
      expect(schema.safeParse("random").success).toBe(false);
    });
  });

  describe("zNumericString", () => {
    it("should parse numeric strings and numbers into valid numeric values", () => {
      const schema = zNumericString({ min: 0, max: 1000, integer: true });

      expect(schema.safeParse("100").data).toBe(100);
      expect(schema.safeParse(500).data).toBe(500);
    });

    it("should reject non-numeric strings or values violating boundary constraints", () => {
      const schema = zNumericString({ min: 10, max: 100, integer: true });

      expect(schema.safeParse("abc").success).toBe(false);
      expect(schema.safeParse("   ").success).toBe(false);
      expect(schema.safeParse("5").success).toBe(false);
      expect(schema.safeParse("150").success).toBe(false);
      expect(schema.safeParse("15.5").success).toBe(false);
      expect(schema.safeParse(15.5).success).toBe(false);
    });
  });
});
