import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockFindFirst,
  mockInsert,
  mockReturning,
  mockValues,
} from "../tests/utils/db-mock";
import { ProductService } from "./product.service";
import type { IDatabase } from "../client";

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
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockFindFirst.mockResolvedValueOnce(mockProduct);

    const result = await productService.getById("uuid-123");

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        id: "uuid-123",
      },
    });
    expect(result).toEqual(mockProduct);
  });
});
