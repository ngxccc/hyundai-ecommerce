import { describe, expect, it } from "bun:test";
import { v7 as uuidv7 } from "uuid";
import { movieListQuerySchema } from "./movie-list-query.dto";

describe("MovieListQueryDto Validation", () => {
  describe("default values", () => {
    it("should populate default page=1, limit=20, and lang=vi when given empty object", () => {
      const result = movieListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.lang).toBe("vi");
      }
    });
  });

  describe("status field (strict kebab-case)", () => {
    it("should accept valid kebab-case status values now-showing and coming-soon", () => {
      expect(
        movieListQuerySchema.safeParse({ status: "now-showing" }).success,
      ).toBe(true);
      expect(
        movieListQuerySchema.safeParse({ status: "coming-soon" }).success,
      ).toBe(true);
    });

    it("should reject snake_case status values", () => {
      expect(
        movieListQuerySchema.safeParse({ status: "now_showing" }).success,
      ).toBe(false);
      expect(
        movieListQuerySchema.safeParse({ status: "coming_soon" }).success,
      ).toBe(false);
    });

    it("should reject invalid status value", () => {
      expect(
        movieListQuerySchema.safeParse({ status: "archived" }).success,
      ).toBe(false);
    });
  });

  describe("genreId field", () => {
    it("should accept valid UUIDv7 genreId", () => {
      const validId = uuidv7();
      const result = movieListQuerySchema.safeParse({ genreId: validId });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.genreId).toBe(validId);
      }
    });

    it("should reject invalid genreId", () => {
      expect(
        movieListQuerySchema.safeParse({ genreId: "invalid-uuid" }).success,
      ).toBe(false);
    });
  });

  describe("rating field", () => {
    it("should accept valid movie ratings", () => {
      expect(movieListQuerySchema.safeParse({ rating: "PG_13" }).success).toBe(
        true,
      );
      expect(movieListQuerySchema.safeParse({ rating: "R" }).success).toBe(
        true,
      );
    });

    it("should reject unknown rating", () => {
      expect(
        movieListQuerySchema.safeParse({ rating: "UNKNOWN" }).success,
      ).toBe(false);
    });
  });

  describe("pagination fields", () => {
    it("should coerce numeric strings to numbers", () => {
      const result = movieListQuerySchema.safeParse({ page: "3", limit: "50" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject page < 1", () => {
      expect(movieListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
      expect(movieListQuerySchema.safeParse({ page: "-1" }).success).toBe(
        false,
      );
    });

    it("should reject limit < 1 (zero or negative)", () => {
      const zeroResult = movieListQuerySchema.safeParse({ limit: "0" });
      expect(zeroResult.success).toBe(false);
      const negativeResult = movieListQuerySchema.safeParse({ limit: "-5" });
      expect(negativeResult.success).toBe(false);
    });

    it("should reject limit > 100", () => {
      const result = movieListQuerySchema.safeParse({ limit: "101" });
      expect(result.success).toBe(false);
    });

    it("should reject non-integer page or limit", () => {
      expect(movieListQuerySchema.safeParse({ page: "1.5" }).success).toBe(
        false,
      );
      expect(movieListQuerySchema.safeParse({ limit: "20.5" }).success).toBe(
        false,
      );
    });
  });

  describe("search sanitization", () => {
    it("should sanitize and trim search query string", () => {
      const result = movieListQuerySchema.safeParse({
        search: "  <b>Batman</b>  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe("Batman");
      }
    });
  });

  describe("strict whitelisting", () => {
    it("should reject unrecognized extra query parameters", () => {
      const result = movieListQuerySchema.safeParse({
        unauthorizedParam: "evil",
      });
      expect(result.success).toBe(false);
    });
  });
});
