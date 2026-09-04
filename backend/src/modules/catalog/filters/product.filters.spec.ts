import { describe, expect, test } from "bun:test";
import { escapeLikePattern, productFilters } from "./product.filters";

describe("productFilters", () => {
  describe("escapeLikePattern", () => {
    test("should escape special PostgreSQL ILIKE characters (%, _, \\)", () => {
      expect(escapeLikePattern("100%")).toBe("100\\%");
      expect(escapeLikePattern("product_name")).toBe("product\\_name");
      expect(escapeLikePattern("path\\to")).toBe("path\\\\to");
      expect(escapeLikePattern("Hyundai 60kVA")).toBe("Hyundai 60kVA");
    });
  });

  describe("isAvailable", () => {
    test("should return non-null SQL condition for non-deleted active products", () => {
      const filter = productFilters.isAvailable();
      expect(filter).toBeDefined();
    });
  });

  describe("bySearch", () => {
    test("should return undefined when search keyword is empty or whitespace", () => {
      expect(productFilters.bySearch()).toBeUndefined();
      expect(productFilters.bySearch("")).toBeUndefined();
      expect(productFilters.bySearch("   ")).toBeUndefined();
    });

    test("should return SQL condition when valid search keyword provided", () => {
      const filter = productFilters.bySearch("DHY65KSE");
      expect(filter).toBeDefined();
    });
  });

  describe("byBrandId", () => {
    test("should return undefined when brandId is not provided", () => {
      expect(productFilters.byBrandId()).toBeUndefined();
    });

    test("should return SQL condition when brandId is provided", () => {
      const filter = productFilters.byBrandId(
        "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
      );
      expect(filter).toBeDefined();
    });
  });

  describe("byCategoryId", () => {
    test("should return undefined when categoryId is not provided", () => {
      expect(productFilters.byCategoryId()).toBeUndefined();
    });

    test("should return SQL condition when categoryId is provided", () => {
      const filter = productFilters.byCategoryId(
        "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
      );
      expect(filter).toBeDefined();
    });
  });

  describe("byPriceRange", () => {
    test("should return undefined when neither min nor max is provided", () => {
      expect(productFilters.byPriceRange(undefined, undefined)).toBeUndefined();
    });

    test("should return SQL condition when min price is provided", () => {
      expect(productFilters.byPriceRange(1000000, undefined)).toBeDefined();
    });

    test("should return SQL condition when max price is provided", () => {
      expect(productFilters.byPriceRange(undefined, 50000000)).toBeDefined();
    });
  });

  describe("byPowerRange", () => {
    test("should return undefined when neither min nor max is provided", () => {
      expect(productFilters.byPowerRange(undefined, undefined)).toBeUndefined();
    });

    test("should return SQL condition when power boundaries are provided", () => {
      expect(productFilters.byPowerRange(10, 100)).toBeDefined();
    });
  });

  describe("byVoltage", () => {
    test("should return undefined when voltage is empty", () => {
      expect(productFilters.byVoltage(null)).toBeUndefined();
      expect(productFilters.byVoltage("")).toBeUndefined();
    });

    test("should return SQL condition when voltage is specified", () => {
      expect(productFilters.byVoltage("230V")).toBeDefined();
    });
  });

  describe("byPhase", () => {
    test("should return undefined when phase is empty", () => {
      expect(productFilters.byPhase(null)).toBeUndefined();
    });

    test("should return SQL condition when phase is specified", () => {
      expect(productFilters.byPhase("3phase")).toBeDefined();
    });
  });

  describe("byFuelType", () => {
    test("should return undefined when fuelType is empty", () => {
      expect(productFilters.byFuelType(null)).toBeUndefined();
    });

    test("should return SQL condition when fuelType is specified", () => {
      expect(productFilters.byFuelType("diesel")).toBeDefined();
    });
  });

  describe("byCanopyType", () => {
    test("should return undefined when canopyType is empty", () => {
      expect(productFilters.byCanopyType(null)).toBeUndefined();
    });

    test("should return SQL condition when canopyType is specified", () => {
      expect(productFilters.byCanopyType("silent")).toBeDefined();
    });
  });
});
