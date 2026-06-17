import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockFindMany,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockReturning,
  mockWhere,
  mockLimit,
} from "../../tests/utils/db-mock";
import { type BrandDTO } from "../../dtos";
import { DbBrandService } from "./brand.service";
import type { IDatabase } from "../../client";

const brandService = new DbBrandService(mockDb as unknown as IDatabase);

describe("BrandService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAll() should return a list of brands", async () => {
    const mockBrands: BrandDTO[] = [
      {
        id: "1",
        name: "Hyundai",
        slug: "hyundai",
        logo: null,
        descriptionVi: null,
        descriptionEn: null,
        isActive: true,
      },
    ];

    mockFindMany.mockResolvedValueOnce(mockBrands);

    const result = await brandService.getAll();

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith({
      columns: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        descriptionVi: true,
        descriptionEn: true,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(result).toEqual(mockBrands);
  });

  test("create() should insert and return new brand", async () => {
    const mockBrandDto: BrandDTO = {
      id: "1",
      name: "Hyundai",
      slug: "hyundai",
      logo: null,
      descriptionVi: null,
      descriptionEn: null,
      isActive: true,
    };
    mockReturning.mockResolvedValueOnce([mockBrandDto]);

    const result = await brandService.create({
      name: "Hyundai",
      slug: "hyundai",
      isActive: true,
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockBrandDto);
  });

  test("create() should return error validation.slugExists on duplicate key error", () => {
    mockReturning.mockRejectedValueOnce({ code: "23505" });
    expect(
      brandService.create({
        name: "Hyundai",
        slug: "hyundai",
        isActive: true,
      }),
    ).rejects.toThrow("errors.validation.slugExists");
  });

  test("update() should update and return brand", async () => {
    const mockBrandDto: BrandDTO = {
      id: "1",
      name: "Hyundai Updated",
      slug: "hyundai-updated",
      logo: null,
      descriptionVi: null,
      descriptionEn: null,
      isActive: true,
    };
    mockReturning.mockResolvedValueOnce([mockBrandDto]);

    const result = await brandService.update({
      id: "1",
      name: "Hyundai Updated",
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockBrandDto);
  });

  test("getById() should return brand when found", async () => {
    const mockBrandDto: BrandDTO = {
      id: "1",
      name: "Hyundai",
      slug: "hyundai",
      logo: null,
      descriptionVi: null,
      descriptionEn: null,
      isActive: true,
    };
    mockLimit.mockResolvedValueOnce([mockBrandDto]);

    const result = await brandService.getById("1");

    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockBrandDto);
  });

  test("getById() should throw error when not found", () => {
    mockLimit.mockResolvedValueOnce([]);

    expect(brandService.getById("99")).rejects.toThrow("errors.brandNotFound");

    expect(mockLimit).toHaveBeenCalledTimes(1);
  });

  test("delete() should delete brand", async () => {
    mockWhere.mockResolvedValueOnce([]);

    const result = await brandService.delete("1");

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(result).toEqual(true);
  });
});
