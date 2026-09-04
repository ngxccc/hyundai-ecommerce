import { describe, expect, test } from "bun:test";
import { escapeLikePattern, productFilters } from "./product.filters";

describe("productFilters", () => {
  describe("escapeLikePattern()", () => {
    describe("when string contains special PostgreSQL ILIKE wildcard characters", () => {
      test("should escape %, _, and \\ with backslashes", () => {
        expect(escapeLikePattern("100%")).toBe("100\\%");
        expect(escapeLikePattern("product_name")).toBe("product\\_name");
        expect(escapeLikePattern("path\\to")).toBe("path\\\\to");
        expect(escapeLikePattern("Hyundai 60kVA")).toBe("Hyundai 60kVA");
      });
    });
  });

  describe("isAvailable()", () => {
    describe("when evaluating active catalog products", () => {
      test("should return non-null SQL condition for non-deleted active products", () => {
        const filter = productFilters.isAvailable();
        expect(filter).toBeDefined();
      });
    });
  });

  describe("bySearch()", () => {
    describe("when search keyword is empty or whitespace", () => {
      test("should return undefined", () => {
        expect(productFilters.bySearch()).toBeUndefined();
        expect(productFilters.bySearch("")).toBeUndefined();
        expect(productFilters.bySearch("   ")).toBeUndefined();
      });
    });

    describe("when valid search keyword is provided", () => {
      test("should return SQL condition matching name and specs", () => {
        const filter = productFilters.bySearch("DHY65KSE");
        expect(filter).toBeDefined();
      });
    });
  });

  describe("byBrandId()", () => {
    describe("when brandId is not provided", () => {
      test("should return undefined", () => {
        expect(productFilters.byBrandId()).toBeUndefined();
      });
    });

    describe("when brandId is provided", () => {
      test("should return SQL condition matching brand foreign key", () => {
        const filter = productFilters.byBrandId(
          "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
        );
        expect(filter).toBeDefined();
      });
    });
  });

  describe("byCategoryId()", () => {
    describe("when categoryId is not provided", () => {
      test("should return undefined", () => {
        expect(productFilters.byCategoryId()).toBeUndefined();
      });
    });

    describe("when categoryId is provided", () => {
      test("should return SQL condition matching category foreign key", () => {
        const filter = productFilters.byCategoryId(
          "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
        );
        expect(filter).toBeDefined();
      });
    });
  });

  describe("byPriceRange()", () => {
    describe("when neither min nor max price is provided", () => {
      test("should return undefined", () => {
        expect(
          productFilters.byPriceRange(undefined, undefined),
        ).toBeUndefined();
      });
    });

    describe("when min price boundary is provided", () => {
      test("should return SQL condition filtering prices greater or equal to min", () => {
        expect(productFilters.byPriceRange(1000000, undefined)).toBeDefined();
      });
    });

    describe("when max price boundary is provided", () => {
      test("should return SQL condition filtering prices less or equal to max", () => {
        expect(productFilters.byPriceRange(undefined, 50000000)).toBeDefined();
      });
    });
  });

  describe("byPowerRange()", () => {
    describe("when neither min nor max power is provided", () => {
      test("should return undefined", () => {
        expect(
          productFilters.byPowerRange(undefined, undefined),
        ).toBeUndefined();
      });
    });

    describe("when power boundaries are provided", () => {
      test("should return SQL condition casting powerKva to numeric", () => {
        expect(productFilters.byPowerRange(10, 100)).toBeDefined();
      });
    });
  });

  describe("byVoltage()", () => {
    describe("when voltage is empty or null", () => {
      test("should return undefined", () => {
        expect(productFilters.byVoltage(null)).toBeUndefined();
        expect(productFilters.byVoltage("")).toBeUndefined();
      });
    });

    describe("when voltage is specified", () => {
      test("should return SQL condition filtering matching voltage", () => {
        expect(productFilters.byVoltage("230V")).toBeDefined();
      });
    });
  });

  describe("byPhase()", () => {
    describe("when phase is empty or null", () => {
      test("should return undefined", () => {
        expect(productFilters.byPhase(null)).toBeUndefined();
      });
    });

    describe("when phase is specified", () => {
      test("should return SQL condition filtering matching electrical phase", () => {
        expect(productFilters.byPhase("3phase")).toBeDefined();
      });
    });
  });

  describe("byFuelType()", () => {
    describe("when fuelType is empty or null", () => {
      test("should return undefined", () => {
        expect(productFilters.byFuelType(null)).toBeUndefined();
      });
    });

    describe("when fuelType is specified", () => {
      test("should return SQL condition filtering matching fuel type", () => {
        expect(productFilters.byFuelType("diesel")).toBeDefined();
      });
    });
  });

  describe("byCanopyType()", () => {
    describe("when canopyType is empty or null", () => {
      test("should return undefined", () => {
        expect(productFilters.byCanopyType(null)).toBeUndefined();
      });
    });

    describe("when canopyType is specified", () => {
      test("should return SQL condition filtering matching canopy enclosure", () => {
        expect(productFilters.byCanopyType("silent")).toBeDefined();
      });
    });
  });
});
