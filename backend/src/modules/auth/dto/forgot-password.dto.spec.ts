import { describe, expect, it } from "bun:test";
import { ForgotPasswordDto, forgotPasswordSchema } from "./forgot-password.dto";

describe("ForgotPasswordDto Validation", () => {
  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = { email: "user@example.com" };
      const result = forgotPasswordSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(ForgotPasswordDto.zodSchema).toBe(forgotPasswordSchema);
    });
  });

  describe("email field", () => {
    it("should normalize email to lowercase and trim whitespace when formatted email is provided", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "  USER@EXAMPLE.COM ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
      }
    });

    it("should fail validation when email format is invalid", () => {
      expect(forgotPasswordSchema.safeParse({ email: "invalid" }).success).toBe(
        false,
      );
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      expect(
        forgotPasswordSchema.safeParse({
          email: "user@example.com",
          extra: "1",
        }).success,
      ).toBe(false);
    });
  });
});
