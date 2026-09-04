import { describe, expect, it } from "bun:test";
import { computeFacets } from "./facet-engine";
import type { ComputeFacetsParams } from "../types/facet-engine";

const mockBrands = [
  { id: "b-hyundai", slug: "hyundai" },
  { id: "b-honda", slug: "honda" },
  { id: "b-koala", slug: "koala" },
];

const mockCategories = [
  { id: "c-gen", slug: "generator", parentId: null },
  { id: "c-diesel", slug: "diesel-generator", parentId: "c-gen" },
  { id: "c-gas", slug: "gas-generator", parentId: "c-gen" },
  { id: "c-pump", slug: "pump", parentId: null },
];

const mockProducts: ComputeFacetsParams["products"] = [
  {
    id: "p1",
    categoryId: "c-diesel", // child of generator
    brandId: "b-hyundai",
    name: "Hyundai Diesel Generator 10kW",
    specs: {
      power: 10,
      voltage: 220,
      phase: "1phase",
      fuelType: "diesel",
      engineBrand: "Hyundai",
      alternatorBrand: "Hyundai",
    },
  },
  {
    id: "p2",
    categoryId: "c-gas", // child of generator
    brandId: "b-honda",
    name: "Honda Gas Generator 5kW",
    specs: {
      power: 5,
      voltage: 220,
      phase: "1phase",
      fuelType: "gas",
      engineBrand: "Honda",
      alternatorBrand: "Honda",
    },
  },
  {
    id: "p3",
    categoryId: "c-diesel",
    brandId: "b-hyundai",
    name: "Hyundai Heavy 3-Phase Generator 50kW",
    specs: {
      power: 50,
      voltage: 380,
      phase: "3phase",
      fuelType: "diesel",
      engineBrand: "Hyundai",
      alternatorBrand: "MeccAlte",
    },
  },
  {
    id: "p4",
    categoryId: "c-pump",
    brandId: "b-koala",
    name: "Koala Water Pump 2kW",
    specs: {
      power: 2,
      voltage: 220,
      phase: "1phase",
      fuelType: "gasoline",
      engineBrand: "Koala",
      alternatorBrand: null,
    },
  },
];

const emptyFilters: ComputeFacetsParams["activeFilters"] = {
  categorySlug: null,
  brandSlugs: [],
  fuelType: null,
  phase: null,
  minPower: null,
  maxPower: null,
  voltage: null,
  engineBrand: null,
  alternatorBrand: null,
  q: null,
};

describe("computeFacets() TDD Engine", () => {
  it("should keep all active options enabled when no filters are set", () => {
    const result = computeFacets({
      products: mockProducts,
      brands: mockBrands,
      categories: mockCategories,
      activeFilters: emptyFilters,
    });

    // All categories with products should be enabled
    expect(result.categories["generator"]).toBe(true);
    expect(result.categories["diesel-generator"]).toBe(true);
    expect(result.categories["gas-generator"]).toBe(true);
    expect(result.categories["pump"]).toBe(true);

    // All brands with products should be enabled
    expect(result.brands["hyundai"]).toBe(true);
    expect(result.brands["honda"]).toBe(true);
    expect(result.brands["koala"]).toBe(true);

    // All specs with products should be enabled
    expect(result.fuelTypes["diesel"]).toBe(true);
    expect(result.fuelTypes["gas"]).toBe(true);
    expect(result.fuelTypes["gasoline"]).toBe(true);

    expect(result.phases["1phase"]).toBe(true);
    expect(result.phases["3phase"]).toBe(true);
  });

  it("should disable options that do not exist in the product catalog at all", () => {
    const brandsWithUnused = [
      ...mockBrands,
      { id: "b-unused", slug: "unused-brand" },
    ];
    const categoriesWithUnused = [
      ...mockCategories,
      { id: "c-unused", slug: "unused-category", parentId: null },
    ];

    const result = computeFacets({
      products: mockProducts,
      brands: brandsWithUnused,
      categories: categoriesWithUnused,
      activeFilters: emptyFilters,
    });

    expect(result.brands["unused-brand"]).toBe(false);
    expect(result.categories["unused-category"]).toBe(false);
  });

  it("should handle category filter and category hierarchy correctly", () => {
    // 1. Filter by parent category "generator"
    const resultGen = computeFacets({
      products: mockProducts,
      brands: mockBrands,
      categories: mockCategories,
      activeFilters: { ...emptyFilters, categorySlug: "generator" },
    });

    // Products in diesel-generator and gas-generator are child of generator
    expect(resultGen.brands["hyundai"]).toBe(true); // p1, p3 are generator
    expect(resultGen.brands["honda"]).toBe(true); // p2 is generator
    expect(resultGen.brands["koala"]).toBe(false); // p4 is pump (not generator)

    // 2. Filter by child category "gas-generator"
    const resultGas = computeFacets({
      products: mockProducts,
      brands: mockBrands,
      categories: mockCategories,
      activeFilters: { ...emptyFilters, categorySlug: "gas-generator" },
    });

    expect(resultGas.brands["honda"]).toBe(true); // Honda has gas generator (p2)
    expect(resultGas.brands["hyundai"]).toBe(false); // Hyundai only has diesel
  });

  it("should handle brand filter without disabling other brands (intra-category exemption)", () => {
    const result = computeFacets({
      products: mockProducts,
      brands: mockBrands,
      categories: mockCategories,
      activeFilters: { ...emptyFilters, brandSlugs: ["hyundai"] },
    });

    // Selecting Hyundai should NOT disable Honda or Koala checkboxes
    // (so the user can check multiple brands)
    expect(result.brands["hyundai"]).toBe(true);
    expect(result.brands["honda"]).toBe(true);
    expect(result.brands["koala"]).toBe(true);

    // But it SHOULD filter spec options based on Hyundai products (p1, p3)
    expect(result.fuelTypes["diesel"]).toBe(true);
    expect(result.fuelTypes["gasoline"]).toBe(false); // Hyundai doesn't have gasoline
    expect(result.fuelTypes["gas"]).toBe(false); // Hyundai doesn't have gas
  });

  it("should cross-filter specification dimensions correctly", () => {
    // Select FuelType = diesel
    const result = computeFacets({
      products: mockProducts,
      brands: mockBrands,
      categories: mockCategories,
      activeFilters: { ...emptyFilters, fuelType: "diesel" },
    });

    // Both 1phase (p1) and 3phase (p3) are diesel, so both phase buttons enabled
    expect(result.phases["1phase"]).toBe(true);
    expect(result.phases["3phase"]).toBe(true);

    // Brand "honda" (gas) and "koala" (gasoline) should be disabled
    expect(result.brands["hyundai"]).toBe(true);
    expect(result.brands["honda"]).toBe(false);
    expect(result.brands["koala"]).toBe(false);
  });

  it("should support text search query (q) case-insensitive matching", () => {
    const result = computeFacets({
      products: mockProducts,
      brands: mockBrands,
      categories: mockCategories,
      activeFilters: { ...emptyFilters, q: "heavy" },
    });

    // Only p3 contains "heavy" (in name)
    expect(result.brands["hyundai"]).toBe(true); // p3 is hyundai
    expect(result.brands["honda"]).toBe(false);
    expect(result.brands["koala"]).toBe(false);

    expect(result.phases["3phase"]).toBe(true);
    expect(result.phases["1phase"]).toBe(false); // p3 is 3phase
  });

  it("should support numeric ranges (power, voltage)", () => {
    // Filter by power range: 40kW to 100kW
    const result = computeFacets({
      products: mockProducts,
      brands: mockBrands,
      categories: mockCategories,
      activeFilters: { ...emptyFilters, minPower: 40, maxPower: 100 },
    });

    // Only p3 (50kW) fits
    expect(result.brands["hyundai"]).toBe(true);
    expect(result.brands["honda"]).toBe(false);
    expect(result.brands["koala"]).toBe(false);
    expect(result.phases["3phase"]).toBe(true);
    expect(result.phases["1phase"]).toBe(false);
  });

  it("should guarantee that currently selected checkboxes remain enabled (selection exemption)", () => {
    // Scenario: User selects Brand = honda AND fuelType = diesel
    // There are NO products that match BOTH (Honda is gas, diesel is Hyundai).
    // Usually, this would result in both being disabled if we checked strict intersection.
    // To allow unchecking, the currently active checkboxes MUST stay enabled!
    const result = computeFacets({
      products: mockProducts,
      brands: mockBrands,
      categories: mockCategories,
      activeFilters: {
        ...emptyFilters,
        brandSlugs: ["honda"],
        fuelType: "diesel",
      },
    });

    // "honda" is checked, so it must stay enabled
    expect(result.brands["honda"]).toBe(true);
    // "diesel" is checked, so it must stay enabled
    expect(result.fuelTypes["diesel"]).toBe(true);

    // Other brands (hyundai) or fuel types (gas) are computed normally
    // For "hyundai": active filter is fuelType=diesel. Hyundai has diesel products, so enabled.
    expect(result.brands["hyundai"]).toBe(true);
    // For "gas": active filter is brand=honda. Honda has gas products, so enabled.
    expect(result.fuelTypes["gas"]).toBe(true);
  });
});
