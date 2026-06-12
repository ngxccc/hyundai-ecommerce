import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockFindFirst,
  mockInsert,
  mockReturning,
  mockValues,
  mockSelectResolvedValue,
  mockSelect,
} from "../../tests/utils/db-mock";
import { ProductService } from "./product.service";
import type { IDatabase } from "../../client";

const productService = new ProductService(mockDb as unknown as IDatabase);

describe("ProductService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("create() should insert and return the created product", async () => {
    const newProduct = {
      name: "Test Generator",
      slug: "test-generator",
      price: "1000",
      images: [],
      isQuoteOnly: false,
      totalStockCache: 0,
      description: null,
      shortDescription: null,
      brandId: null,
      categoryId: null,
      specs: null,
      totalSalesCache: 0,
    };

    const mockReturnedDbProduct = {
      ...newProduct,
      id: "uuid-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    mockReturning.mockResolvedValue([mockReturnedDbProduct]);

    const result = await productService.create(newProduct);

    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(newProduct);
    expect(result).toEqual(mockReturnedDbProduct);
  });

  test("getById() should return a product if found", async () => {
    const mockProduct = {
      id: "uuid-123",
      name: "Test",
      slug: "test",
      price: "100",
      images: [],
      isQuoteOnly: false,
      totalStockCache: 0,
      description: null,
      shortDescription: null,
      brandId: null,
      categoryId: null,
      specs: null,
      totalSalesCache: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockFindFirst.mockResolvedValueOnce(mockProduct);

    const result = await productService.getById("uuid-123");

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: expect.anything(),
      }),
    );
    expect(result).toEqual(mockProduct);
  });

  describe("getTopSellingProducts()", () => {
    test("should query database and return top selling products with formatted image", async () => {
      const mockDbResult = [
        {
          id: "prod-1",
          name: "Hyundai HY-30CLE",
          sold: 120,
          price: "12500000",
          images: ["img1.png", "img2.png"],
        },
      ];
      mockSelectResolvedValue.mockResolvedValueOnce(mockDbResult);

      const result = await productService.getTopSellingProducts(5);

      expect(result).toEqual([
        {
          id: "prod-1",
          name: "Hyundai HY-30CLE",
          sold: 120,
          price: "12500000",
          image: "img1.png",
        },
      ]);
    });

    test("should handle empty images array by returning null image", async () => {
      const mockDbResult = [
        {
          id: "prod-2",
          name: "Test Generator",
          sold: 50,
          price: "8500000",
          images: [],
        },
      ];
      mockSelectResolvedValue.mockResolvedValueOnce(mockDbResult);

      const result = await productService.getTopSellingProducts(5);

      expect(result[0]).toEqual({
        id: "prod-2",
        name: "Test Generator",
        sold: 50,
        price: "8500000",
        image: null,
      });
    });
  });

  describe("getAll()", () => {
    test("should support priceAsc sorting", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Generator Low Price",
          price: "1000",
          createdAt: new Date(),
          categories: null,
        },
      ] as unknown as Awaited<ReturnType<ProductService["getAll"]>>["data"];
      mockSelectResolvedValue.mockResolvedValueOnce(mockProducts);

      const result = await productService.getAll(10, { sort: "priceAsc" });

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(mockProducts);
    });

    test("should support categoryIds array filter", async () => {
      const mockProducts = [
        {
          id: "prod-2",
          name: "Generator In Category",
          price: "2000",
          createdAt: new Date(),
          categories: null,
        },
      ] as unknown as Awaited<ReturnType<ProductService["getAll"]>>["data"];
      mockSelectResolvedValue.mockResolvedValueOnce(mockProducts);

      const result = await productService.getAll(10, {
        categoryIds: ["cat-1", "cat-2"],
      });

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(mockProducts);
    });
  });

  describe("getFiltersMetadata()", () => {
    test("should query database and return mapped filters metadata", async () => {
      const mockDbResult = [
        {
          id: "prod-1",
          name: "Hyundai Generator",
          categoryId: "cat-1",
          brandId: "brand-1",
          power: "10.5",
          voltage: "220",
          phase: "1phase",
          fuelType: "diesel",
          engineBrand: "Hyundai",
          alternatorBrand: "Hyundai",
        },
      ];
      mockSelectResolvedValue.mockResolvedValueOnce(mockDbResult);

      const result = await productService.getFiltersMetadata();

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          id: "prod-1",
          name: "Hyundai Generator",
          categoryId: "cat-1",
          brandId: "brand-1",
          specs: {
            power: 10.5,
            voltage: 220,
            phase: "1phase",
            fuelType: "diesel",
            engineBrand: "Hyundai",
            alternatorBrand: "Hyundai",
          },
        },
      ]);
    });

    test("should handle null or invalid values in database mapping", async () => {
      const mockDbResult = [
        {
          id: "prod-2",
          name: "Null Product",
          categoryId: null,
          brandId: null,
          power: null,
          voltage: null,
          phase: null,
          fuelType: null,
          engineBrand: null,
          alternatorBrand: null,
        },
      ];
      mockSelectResolvedValue.mockResolvedValueOnce(mockDbResult);

      const result = await productService.getFiltersMetadata();

      expect(result[0]).toEqual({
        id: "prod-2",
        name: "Null Product",
        categoryId: null,
        brandId: null,
        specs: {
          power: null,
          voltage: null,
          phase: null,
          fuelType: null,
          engineBrand: null,
          alternatorBrand: null,
        },
      });
    });
  });
});
