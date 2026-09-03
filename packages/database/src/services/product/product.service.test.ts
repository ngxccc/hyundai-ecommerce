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
import type { ProductDTO, Product } from "../../schemas";
import { DbProductService } from "./product.service";
import type { IDatabase } from "../../client";

function toProductDto(product: Product): ProductDTO {
  return {
    id: product.id,
    nameVi: product.nameVi,
    nameEn: product.nameEn,
    slug: product.slug,
    price: product.price,
    descriptionVi: product.descriptionVi,
    descriptionEn: product.descriptionEn,
    shortDescriptionVi: product.shortDescriptionVi,
    shortDescriptionEn: product.shortDescriptionEn,
    images: product.images,
    brandId: product.brandId,
    categoryId: product.categoryId,
    specs: product.specs,
    totalStockCache: product.totalStockCache,
    isQuoteOnly: product.isQuoteOnly,
  };
}

const productService = new DbProductService(mockDb as unknown as IDatabase);

describe("ProductService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("create() should insert and return the created product", async () => {
    const newProduct = {
      nameVi: "Test Generator",
      nameEn: null,
      slug: "test-generator",
      price: "1000",
      images: [],
      isQuoteOnly: false,
      totalStockCache: 0,
      descriptionVi: null,
      descriptionEn: null,
      shortDescriptionVi: null,
      shortDescriptionEn: null,
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
    mockReturning.mockResolvedValue([toProductDto(mockReturnedDbProduct)]);

    const result = await productService.create(newProduct);

    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(newProduct);
    expect(result).toEqual(toProductDto(mockReturnedDbProduct));
  });

  test("getById() should return a product if found", async () => {
    const mockProduct = {
      id: "uuid-123",
      nameVi: "Test",
      nameEn: null,
      slug: "test",
      price: "100",
      images: [],
      isQuoteOnly: false,
      totalStockCache: 0,
      descriptionVi: null,
      descriptionEn: null,
      shortDescriptionVi: null,
      shortDescriptionEn: null,
      brandId: null,
      categoryId: null,
      specs: null,
      totalSalesCache: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockFindFirst.mockResolvedValueOnce(toProductDto(mockProduct));

    const result = await productService.getById("uuid-123");

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: expect.anything(),
      }),
    );
    expect(result).toEqual(toProductDto(mockProduct));
  });

  describe("getTopSellingProducts()", () => {
    test("should query database and return top selling products with formatted image", async () => {
      const mockDbResult = [
        {
          id: "prod-1",
          nameVi: "Hyundai HY-30CLE",
          nameEn: null,
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
          nameVi: "Hyundai HY-30CLE",
          nameEn: null,
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
          nameVi: "Test Generator",
          nameEn: null,
          sold: 50,
          price: "8500000",
          images: [],
        },
      ];
      mockSelectResolvedValue.mockResolvedValueOnce(mockDbResult);

      const result = await productService.getTopSellingProducts(5);

      expect(result[0]).toEqual({
        id: "prod-2",
        nameVi: "Test Generator",
        nameEn: null,
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
          nameVi: "Generator Low Price",
          nameEn: null,
          price: "1000",
          createdAt: new Date(),
          categories: null,
        },
      ] as unknown as Product[];
      mockSelectResolvedValue.mockResolvedValueOnce(mockProducts);

      const result = await productService.getAll(10, { sort: "priceAsc" });

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(mockProducts.map(toProductDto));
    });

    test("should support categoryIds array filter", async () => {
      const mockProducts = [
        {
          id: "prod-2",
          nameVi: "Generator In Category",
          nameEn: null,
          price: "2000",
          createdAt: new Date(),
          categories: null,
        },
      ] as unknown as Product[];
      mockSelectResolvedValue.mockResolvedValueOnce(mockProducts);

      const result = await productService.getAll(10, {
        categoryIds: ["cat-1", "cat-2"],
      });

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(mockProducts.map(toProductDto));
    });
  });

  describe("getFiltersMetadata()", () => {
    test("should query database and return mapped filters metadata", async () => {
      const mockDbResult = [
        {
          id: "prod-1",
          nameVi: "Hyundai Generator",
          nameEn: null,
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
          nameVi: "Hyundai Generator",
          nameEn: null,
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
          nameVi: "Null Product",
          nameEn: null,
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
        nameVi: "Null Product",
        nameEn: null,
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

  describe("getActiveProductBySlug()", () => {
    test("should return product when found by slug", async () => {
      const mockProduct = {
        id: "prod-1",
        nameVi: "Hyundai HY-30CLE",
        nameEn: null,
        slug: "hyundai-hy-30cle",
        price: "12500000",
        descriptionVi: null,
        descriptionEn: null,
        shortDescriptionVi: null,
        shortDescriptionEn: null,
        images: ["img1.png"],
        brandId: null,
        categoryId: null,
        specs: null,
        totalStockCache: 10,
        isQuoteOnly: false,
      };

      mockSelectResolvedValue.mockResolvedValueOnce([mockProduct]);

      const result =
        await productService.getActiveProductBySlug("hyundai-hy-30cle");

      expect(result).toEqual(mockProduct);
    });

    test("should throw error when product is not found", () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]);

      expect(
        productService.getActiveProductBySlug("non-existent"),
      ).rejects.toThrow("errors.productNotFound");
    });
  });
});
