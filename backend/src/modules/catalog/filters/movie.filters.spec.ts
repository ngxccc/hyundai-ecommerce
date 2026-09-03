import { describe, expect, it } from "bun:test";
import { escapeLikePattern, movieFilters } from "./movie.filters";
import { createMockDb } from "../../../../test/mocks";
import type { DrizzleDB } from "@/database/database.module";

describe("movieFilters", () => {
  const mockDb = createMockDb() as unknown as DrizzleDB;

  describe("escapeLikePattern", () => {
    it("should escape special PostgreSQL ILIKE characters (%, _, \\)", () => {
      expect(escapeLikePattern("100%")).toBe("100\\%");
      expect(escapeLikePattern("user_name")).toBe("user\\_name");
      expect(escapeLikePattern("path\\to")).toBe("path\\\\to");
      expect(escapeLikePattern("normal text")).toBe("normal text");
    });
  });

  describe("byStatus", () => {
    it("should return undefined when status is undefined", () => {
      const filter = movieFilters.byStatus(mockDb, undefined);
      expect(filter).toBeUndefined();
    });

    it("should return a SQL condition when status is now-showing", () => {
      const filter = movieFilters.byStatus(mockDb, "now-showing");
      expect(filter).toBeDefined();
    });

    it("should return a SQL condition when status is coming-soon", () => {
      const filter = movieFilters.byStatus(mockDb, "coming-soon");
      expect(filter).toBeDefined();
    });
  });

  describe("byGenreId", () => {
    it("should return undefined when genreId is undefined", () => {
      const filter = movieFilters.byGenreId(mockDb, undefined);
      expect(filter).toBeUndefined();
    });

    it("should return a SQL condition when genreId is provided", () => {
      const filter = movieFilters.byGenreId(
        mockDb,
        "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
      );
      expect(filter).toBeDefined();
    });
  });

  describe("byRating", () => {
    it("should return undefined when rating is undefined", () => {
      const filter = movieFilters.byRating(undefined);
      expect(filter).toBeUndefined();
    });

    it("should return a SQL condition when rating is provided", () => {
      const filter = movieFilters.byRating("PG_13");
      expect(filter).toBeDefined();
    });
  });

  describe("bySearch", () => {
    it("should return undefined when search is undefined", () => {
      const filter = movieFilters.bySearch(mockDb, undefined);
      expect(filter).toBeUndefined();
    });

    it("should return a SQL condition when search is provided", () => {
      const filter = movieFilters.bySearch(mockDb, "Avatar");
      expect(filter).toBeDefined();
    });
  });
});
