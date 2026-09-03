import { describe, expect, it } from "bun:test";
import { cinemaListQuerySchema } from "./cinema-list-query.dto";

describe("CinemaListQueryDto Validation", () => {
  describe("default values", () => {
    it("should populate default page=1 and limit=20", () => {
      const result = cinemaListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });
  });

  describe("city, ward, and search fields", () => {
    it("should sanitize and trim input strings", () => {
      const result = cinemaListQuerySchema.safeParse({
        city: "  Thành phố Hồ Chí Minh  ",
        ward: "  Phường Bến Nghé  ",
        search: "  CGV Landmark  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.city).toBe("Thành phố Hồ Chí Minh");
        expect(result.data.ward).toBe("Phường Bến Nghé");
        expect(result.data.search).toBe("CGV Landmark");
      }
    });
  });

  describe("pagination constraints", () => {
    it("should reject limit less than 1 (zero or negative)", () => {
      expect(cinemaListQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
      expect(cinemaListQuerySchema.safeParse({ limit: -10 }).success).toBe(
        false,
      );
    });

    it("should reject limit exceeding 100", () => {
      const result = cinemaListQuerySchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it("should reject page less than 1", () => {
      const result = cinemaListQuerySchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });
  });
});
