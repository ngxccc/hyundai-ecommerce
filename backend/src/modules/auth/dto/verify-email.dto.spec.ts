import { describe, expect, it } from "bun:test";
import { VerifyEmailDto, verifyEmailSchema } from "./verify-email.dto";

describe("VerifyEmailDto Validation", () => {
  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when verification token is valid", () => {
      const valid = {
        token:
          "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      };
      const result = verifyEmailSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(VerifyEmailDto.zodSchema).toBe(verifyEmailSchema);
    });
  });

  describe("token field", () => {
    it("should fail validation when token is empty string", () => {
      expect(verifyEmailSchema.safeParse({ token: "" }).success).toBe(false);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      expect(
        verifyEmailSchema.safeParse({
          token:
            "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
          extra: "unrecognized",
        }).success,
      ).toBe(false);
    });
  });
});
