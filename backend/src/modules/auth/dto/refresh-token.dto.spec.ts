import { describe, expect, it } from "bun:test";
import { RefreshTokenDto, refreshTokenSchema } from "./refresh-token.dto";

describe("RefreshTokenDto Validation", () => {
  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when refresh token is valid", () => {
      const valid = { refreshToken: "d9b2e8a1-3c5f-4a7b-8e9d-1f2a3b4c5d6e" };
      const result = refreshTokenSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(RefreshTokenDto.zodSchema).toBe(refreshTokenSchema);
    });
  });

  describe("refreshToken field", () => {
    it("should fail validation when refreshToken is empty string", () => {
      expect(refreshTokenSchema.safeParse({ refreshToken: "" }).success).toBe(
        false,
      );
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      expect(
        refreshTokenSchema.safeParse({
          refreshToken: "d9b2e8a1-3c5f-4a7b-8e9d-1f2a3b4c5d6e",
          extra: "invalid",
        }).success,
      ).toBe(false);
    });
  });
});
