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
import { type CategoryDTO } from "../../dtos";
import { DbCategoryService } from "./category.service";
import type { IDatabase } from "../../client";

const categoryService = new DbCategoryService(mockDb as unknown as IDatabase);

describe("CategoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAll() should return a list of categories using query", async () => {
    const mockCategories = [
      {
        id: "1",
        nameVi: "Generators",
        nameEn: null,
        slug: "generators",
        parentId: null,
        descriptionVi: null,
        descriptionEn: null,
        image: null,
        isActive: true,
      },
    ] as CategoryDTO[];

    mockFindMany.mockResolvedValueOnce(mockCategories);

    const result = await categoryService.getAll();

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith({
      columns: {
        id: true,
        nameVi: true,
        nameEn: true,
        slug: true,
        parentId: true,
        descriptionVi: true,
        descriptionEn: true,
        image: true,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(result).toEqual(mockCategories);
  });

  test("create() should insert and return new category", async () => {
    const mockCategoryDto = {
      id: "1",
      nameVi: "Gensets",
      nameEn: null,
      slug: "gensets",
      parentId: null,
      descriptionVi: null,
      descriptionEn: null,
      image: null,
      isActive: true,
    } as CategoryDTO;
    mockReturning.mockResolvedValueOnce([mockCategoryDto]);

    const result = await categoryService.create({
      nameVi: "Gensets",
      nameEn: null,
      slug: "gensets",
      isActive: true,
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategoryDto);
  });

  test("create() should return error validation.slugExists on duplicate key error", () => {
    mockReturning.mockRejectedValueOnce({ code: "23505" });
    expect(
      categoryService.create({
        nameVi: "Gensets",
        nameEn: null,
        slug: "gensets",
        isActive: true,
      }),
    ).rejects.toThrow("errors.validation.slugExists");
  });

  test("update() should update and return category", async () => {
    const mockCategoryDto = {
      id: "1",
      nameVi: "Updated",
      nameEn: null,
      slug: "updated",
      parentId: null,
      descriptionVi: null,
      descriptionEn: null,
      image: null,
      isActive: true,
    } as CategoryDTO;
    mockReturning.mockResolvedValueOnce([mockCategoryDto]);

    const result = await categoryService.update({ id: "1", nameVi: "Updated" });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategoryDto);
  });

  test("getById() should return category when found", async () => {
    const mockCategoryDto = {
      id: "1",
      nameVi: "Generators",
      nameEn: null,
      slug: "generators",
      parentId: null,
      descriptionVi: null,
      descriptionEn: null,
      image: null,
      isActive: true,
    } as CategoryDTO;
    mockLimit.mockResolvedValueOnce([mockCategoryDto]);

    const result = await categoryService.getById("1");

    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategoryDto);
  });

  test("getById() should throw error when not found", () => {
    mockLimit.mockResolvedValueOnce([]);

    expect(categoryService.getById("99")).rejects.toThrow(
      "errors.categoryNotFound",
    );

    expect(mockLimit).toHaveBeenCalledTimes(1);
  });

  test("delete() should delete category", async () => {
    mockWhere.mockResolvedValueOnce([]);

    const result = await categoryService.delete("1");

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(result).toEqual(true);
  });

  test("getCategoryTree() should return categories in a hierarchical structure", async () => {
    const mockCategories = [
      {
        id: "1",
        nameVi: "Parent",
        nameEn: null,
        slug: "parent",
        parentId: null,
        descriptionVi: null,
        descriptionEn: null,
        image: null,
        isActive: true,
      },
      {
        id: "2",
        nameVi: "Child",
        nameEn: null,
        slug: "child",
        parentId: "1",
        descriptionVi: null,
        descriptionEn: null,
        image: null,
        isActive: true,
      },
    ];

    mockFindMany.mockResolvedValueOnce(mockCategories);

    const result = await categoryService.getCategoryTree();

    expect(result.length).toBe(1);
    expect(result[0]!.id).toBe("1");
    expect(result[0]!.children?.length).toBe(1);
    expect(result[0]!.children?.[0]!.id).toBe("2");
  });

  test("getCategoryDescendants() should return all descendant IDs recursively", async () => {
    const mockCategories = [
      {
        id: "1",
        nameVi: "Parent",
        nameEn: null,
        slug: "parent",
        parentId: null,
        descriptionVi: null,
        descriptionEn: null,
        image: null,
        isActive: true,
      },
      {
        id: "2",
        nameVi: "Child 1",
        nameEn: null,
        slug: "child-1",
        parentId: "1",
        descriptionVi: null,
        descriptionEn: null,
        image: null,
        isActive: true,
      },
      {
        id: "3",
        nameVi: "Child 2",
        nameEn: null,
        slug: "child-2",
        parentId: "2",
        descriptionVi: null,
        descriptionEn: null,
        image: null,
        isActive: true,
      },
    ];

    mockFindMany.mockResolvedValueOnce(mockCategories);

    const result = await categoryService.getCategoryDescendants("1");

    expect(result).toEqual(["1", "2", "3"]);
  });
});
