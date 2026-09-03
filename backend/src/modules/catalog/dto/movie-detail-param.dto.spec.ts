import { describe, expect, it } from "bun:test";
import { v7 as uuidv7 } from "uuid";
import {
  movieDetailParamSchema,
  movieDetailQuerySchema,
} from "./movie-detail-param.dto";

describe("MovieDetailParamDto Validation", () => {
  describe("id field", () => {
    it("should accept valid RFC 9562 UUIDv7", () => {
      const validId = uuidv7();
      const result = movieDetailParamSchema.safeParse({ id: validId });
      expect(result.success).toBe(true);
    });

    it("should reject non-UUIDv7 strings", () => {
      expect(
        movieDetailParamSchema.safeParse({ id: "invalid-uuid" }).success,
      ).toBe(false);
      expect(movieDetailParamSchema.safeParse({ id: "12345" }).success).toBe(
        false,
      );
      // UUIDv4 format (version digit 4)
      expect(
        movieDetailParamSchema.safeParse({
          id: "123e4567-e89b-42d3-a456-426614174000",
        }).success,
      ).toBe(false);
    });
  });

  describe("movieDetailQuerySchema", () => {
    it("should default lang to vi", () => {
      const result = movieDetailQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lang).toBe("vi");
      }
    });

    it("should accept lang=en", () => {
      const result = movieDetailQuerySchema.safeParse({ lang: "en" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lang).toBe("en");
      }
    });
  });
});
