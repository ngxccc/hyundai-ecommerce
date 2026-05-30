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
import { CategoryService } from "./category.service";
import type { IDatabase } from "../client";

const categoryService = new CategoryService(mockDb as unknown as IDatabase);

describe("CategoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAll() should return a list of categories using query", async () => {
    const mockCategories = [
      {
        id: "1",
        name: "Generators",
        slug: "generators",
        parentId: null,
        description: null,
        image: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockFindMany.mockResolvedValueOnce(mockCategories);

    const result = await categoryService.getAll();

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(result).toEqual(mockCategories);
  });

  test("create() should insert and return new category", async () => {
    const mockCategory = {
      id: "1",
      name: "Gensets",
      slug: "gensets",
      parentId: null,
      description: null,
      image: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockReturning.mockResolvedValueOnce([mockCategory]);

    const result = await categoryService.create({
      name: "Gensets",
      slug: "gensets",
      isActive: true,
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: mockCategory });
  });

  test("create() should return error validation.slugExists on duplicate key error", async () => {
    mockReturning.mockRejectedValueOnce({ code: "23505" });
    const result = await categoryService.create({
      name: "Gensets",
      slug: "gensets",
      isActive: true,
    });
    expect(result).toEqual({
      success: false,
      code: "VALIDATION_ERROR",
      error: "validation.slugExists",
    });
  });

  test("update() should update and return category", async () => {
    const mockCategory = {
      id: "1",
      name: "Updated",
      slug: "updated",
      parentId: null,
      description: null,
      image: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockReturning.mockResolvedValueOnce([mockCategory]);

    const result = await categoryService.update({ id: "1", name: "Updated" });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: mockCategory });
  });

  test("delete() should delete category", async () => {
    mockWhere.mockResolvedValueOnce([]);

    const result = await categoryService.delete("1");

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: true });
  });
});
