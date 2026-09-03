import { describe, expect, it } from "bun:test";
import { LoginDto, loginSchema } from "./login.dto";

describe("LoginDto Validation", () => {
  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = {
        email: "user@example.com",
        password: "Password123!",
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(LoginDto.zodSchema).toBe(loginSchema);
    });
  });

  describe("email field", () => {
    it("should normalize email to lowercase and trim whitespace when formatted email is provided", () => {
      const payload = {
        email: "  USER@EXAMPLE.COM  ",
        password: "Password123!",
      };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
      }
    });

    it("should fail validation when email syntax is invalid", () => {
      const payload = { email: "not-an-email", password: "Password123!" };
      expect(loginSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("password field", () => {
    it("should fail validation when password length is under 8 characters", () => {
      const payload = { email: "user@example.com", password: "short" };
      expect(loginSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      const payload = {
        email: "user@example.com",
        password: "Password123!",
        extra: "malicious",
      };
      expect(loginSchema.safeParse(payload).success).toBe(false);
    });
  });
});
