import { describe, expect, it } from "bun:test";
import {
  ResendVerificationDto,
  resendVerificationSchema,
} from "./resend-verification.dto";

describe("ResendVerificationDto Validation", () => {
  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = { email: "user@example.com" };
      const result = resendVerificationSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(ResendVerificationDto.zodSchema).toBe(resendVerificationSchema);
    });
  });

  describe("email field", () => {
    it("should normalize email to lowercase and trim whitespace when formatted email is provided", () => {
      const result = resendVerificationSchema.safeParse({
        email: "  VERIFY.ME@EXAMPLE.COM ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("verify.me@example.com");
      }
    });

    it("should fail validation when email format is invalid", () => {
      expect(
        resendVerificationSchema.safeParse({ email: "invalid" }).success,
      ).toBe(false);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      expect(
        resendVerificationSchema.safeParse({
          email: "user@example.com",
          extra: "1",
        }).success,
      ).toBe(false);
    });
  });
});
