import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockFindMany,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockReturning,
  mockWhere,
} from "../tests/utils/db-mock";
import { BrandService } from "./brand.service";
import type { IDatabase } from "../client";

const brandService = new BrandService(mockDb as unknown as IDatabase);

describe("BrandService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAll() should return a list of brands", async () => {
    const mockBrands = [
      {
        id: "1",
        name: "Hyundai",
        slug: "hyundai",
        logo: null,
        description: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    mockFindMany.mockResolvedValueOnce(mockBrands);

    const result = await brandService.getAll();

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(result).toEqual(mockBrands);
  });

  test("create() should insert and return new brand", async () => {
    const mockBrand = {
      id: "1",
      name: "Hyundai",
      slug: "hyundai",
      logo: null,
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    mockReturning.mockResolvedValueOnce([mockBrand]);

    const result = await brandService.create({
      name: "Hyundai",
      slug: "hyundai",
      isActive: true,
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: mockBrand });
  });

  test("create() should return error validation.slugExists on duplicate key error", async () => {
    mockReturning.mockRejectedValueOnce({ code: "23505" });
    const result = await brandService.create({
      name: "Hyundai",
      slug: "hyundai",
      isActive: true,
    });
    expect(result).toEqual({
      success: false,
      code: "VALIDATION_ERROR",
      error: "validation.slugExists",
    });
  });

  test("update() should update and return brand", async () => {
    const mockBrand = {
      id: "1",
      name: "Hyundai Updated",
      slug: "hyundai-updated",
      logo: null,
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    mockReturning.mockResolvedValueOnce([mockBrand]);

    const result = await brandService.update({
      id: "1",
      name: "Hyundai Updated",
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: mockBrand });
  });

  test("delete() should delete brand", async () => {
    mockWhere.mockResolvedValueOnce([]);

    const result = await brandService.delete("1");

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: true });
  });
});
