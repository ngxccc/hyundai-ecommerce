import { describe, expect, it } from "bun:test";
import { ChangePasswordDto, changePasswordSchema } from "./change-password.dto";

describe("ChangePasswordDto Validation", () => {
  const getValidPayload = () => ({
    currentPassword: "OldPassword123!",
    newPassword: "NewPassword456!",
  });

  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = getValidPayload();
      const result = changePasswordSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(ChangePasswordDto.zodSchema).toBe(changePasswordSchema);
    });
  });

  describe("currentPassword field", () => {
    it("should fail validation when currentPassword is empty string", () => {
      expect(
        changePasswordSchema.safeParse({
          ...getValidPayload(),
          currentPassword: "",
        }).success,
      ).toBe(false);
    });

    it("should fail validation when currentPassword exceeds 256 characters", () => {
      expect(
        changePasswordSchema.safeParse({
          ...getValidPayload(),
          currentPassword: "a".repeat(257),
        }).success,
      ).toBe(false);
    });
  });

  describe("newPassword field", () => {
    it("should fail validation when newPassword length is under 8 characters", () => {
      expect(
        changePasswordSchema.safeParse({
          ...getValidPayload(),
          newPassword: "short",
        }).success,
      ).toBe(false);
    });

    it("should fail validation when newPassword fails complexity requirements", () => {
      expect(
        changePasswordSchema.safeParse({
          ...getValidPayload(),
          newPassword: "password123!",
        }).success,
      ).toBe(false);
      expect(
        changePasswordSchema.safeParse({
          ...getValidPayload(),
          newPassword: "Password!",
        }).success,
      ).toBe(false);
      expect(
        changePasswordSchema.safeParse({
          ...getValidPayload(),
          newPassword: "Password123",
        }).success,
      ).toBe(false);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      expect(
        changePasswordSchema.safeParse({
          ...getValidPayload(),
          extra: "unrecognized",
        }).success,
      ).toBe(false);
    });
  });
});
