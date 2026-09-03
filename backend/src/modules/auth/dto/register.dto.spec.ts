import { describe, expect, it } from "bun:test";
import { RegisterDto, registerSchema } from "./register.dto";

describe("RegisterDto Validation", () => {
  const getValidPayload = () => ({
    email: "test@example.com",
    fullName: "John Doe",
    phoneNumber: "0912345678",
    password: "Password123!",
    confirmPassword: "Password123!",
    agreeTerms: true,
  });

  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = getValidPayload();
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(RegisterDto.zodSchema).toBe(registerSchema);
    });
  });

  describe("email field", () => {
    it("should normalize email to lowercase and trim whitespace when formatted email is provided", () => {
      const payload = {
        ...getValidPayload(),
        email: "  ALEX.DOE+tag@EXAMPLE.COM  ",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("alex.doe+tag@example.com");
      }
    });

    it("should fail validation when email format is invalid", () => {
      const payload = { ...getValidPayload(), email: "invalid-email" };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("fullName field", () => {
    it("should strip HTML tags and collapse whitespace when input contains markup", () => {
      const payload = {
        ...getValidPayload(),
        fullName: "  <script>alert(1)</script> <b>John</b>   Doe  ",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe("John Doe");
      }
    });

    it("should fail validation when fullName is empty string", () => {
      const payload = { ...getValidPayload(), fullName: "" };
      expect(registerSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("phoneNumber field", () => {
    it("should pass validation when valid 10-digit Vietnamese phone numbers are supplied", () => {
      const validPhones = [
        "0912345678",
        "0812345678",
        "0712345678",
        "0512345678",
        "0312345678",
      ];
      for (const phone of validPhones) {
        const payload = { ...getValidPayload(), phoneNumber: phone };
        expect(registerSchema.safeParse(payload).success).toBe(true);
      }
    });

    it("should fail validation when phone prefix or length is invalid", () => {
      const invalidPhones = [
        "0123456789",
        "0212345678",
        "091234567",
        "09123456789",
      ];
      for (const phone of invalidPhones) {
        const payload = { ...getValidPayload(), phoneNumber: phone };
        expect(registerSchema.safeParse(payload).success).toBe(false);
      }
    });
  });

  describe("password & confirmPassword fields", () => {
    it("should fail validation when password fails complexity requirements", () => {
      expect(
        registerSchema.safeParse({
          ...getValidPayload(),
          password: "weak",
          confirmPassword: "weak",
        }).success,
      ).toBe(false);
      expect(
        registerSchema.safeParse({
          ...getValidPayload(),
          password: "password123!",
          confirmPassword: "password123!",
        }).success,
      ).toBe(false);
      expect(
        registerSchema.safeParse({
          ...getValidPayload(),
          password: "Password!",
          confirmPassword: "Password!",
        }).success,
      ).toBe(false);
    });

    it("should fail validation when password and confirmPassword do not match", () => {
      const payload = {
        ...getValidPayload(),
        password: "Password123!",
        confirmPassword: "DifferentPassword456!",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("agreeTerms & strictness controls", () => {
    it("should fail validation when agreeTerms is false", () => {
      const payload = { ...getValidPayload(), agreeTerms: false };
      expect(registerSchema.safeParse(payload).success).toBe(false);
    });

    it("should fail validation when unrecognized keys are present in payload", () => {
      const payload = { ...getValidPayload(), unexpectedKey: "malicious" };
      expect(registerSchema.safeParse(payload).success).toBe(false);
    });
  });
});
