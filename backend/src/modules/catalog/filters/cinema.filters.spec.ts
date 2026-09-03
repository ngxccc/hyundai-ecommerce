import { describe, expect, it } from "bun:test";
import { cinemaFilters } from "./cinema.filters";

describe("cinemaFilters", () => {
  describe("byCity", () => {
    it("should return undefined when city is undefined", () => {
      const filter = cinemaFilters.byCity(undefined);
      expect(filter).toBeUndefined();
    });

    it("should return a SQL condition when city is provided", () => {
      const filter = cinemaFilters.byCity("Ho Chi Minh");
      expect(filter).toBeDefined();
    });
  });

  describe("byWard", () => {
    it("should return undefined when ward is undefined", () => {
      const filter = cinemaFilters.byWard(undefined);
      expect(filter).toBeUndefined();
    });

    it("should return a SQL condition when ward is provided", () => {
      const filter = cinemaFilters.byWard("Ben Nghe");
      expect(filter).toBeDefined();
    });
  });

  describe("bySearch", () => {
    it("should return undefined when search is undefined", () => {
      const filter = cinemaFilters.bySearch(undefined);
      expect(filter).toBeUndefined();
    });

    it("should return a SQL condition when search is provided", () => {
      const filter = cinemaFilters.bySearch("Vincom");
      expect(filter).toBeDefined();
    });
  });
});
