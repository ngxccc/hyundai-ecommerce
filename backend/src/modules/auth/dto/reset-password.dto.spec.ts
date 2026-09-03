import { describe, expect, it } from "bun:test";
import { ResetPasswordDto, resetPasswordSchema } from "./reset-password.dto";

describe("ResetPasswordDto Validation", () => {
  const getValidPayload = () => ({
    token: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    password: "NewPassword123!",
    confirmPassword: "NewPassword123!",
  });

  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = getValidPayload();
      const result = resetPasswordSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(ResetPasswordDto.zodSchema).toBe(resetPasswordSchema);
    });
  });

  describe("token field", () => {
    it("should fail validation when token is empty string", () => {
      expect(
        resetPasswordSchema.safeParse({ ...getValidPayload(), token: "" })
          .success,
      ).toBe(false);
    });
  });

  describe("password & confirmPassword fields", () => {
    it("should fail validation when password fails complexity criteria", () => {
      expect(
        resetPasswordSchema.safeParse({
          ...getValidPayload(),
          password: "password123!",
          confirmPassword: "password123!",
        }).success,
      ).toBe(false);
    });

    it("should fail validation when password and confirmPassword do not match", () => {
      const payload = {
        ...getValidPayload(),
        password: "NewPassword123!",
        confirmPassword: "DifferentPassword456!",
      };
      expect(resetPasswordSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      expect(
        resetPasswordSchema.safeParse({
          ...getValidPayload(),
          extraField: "invalid",
        }).success,
      ).toBe(false);
    });
  });
});
