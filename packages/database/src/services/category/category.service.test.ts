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
import { CategoryService } from "./category.service";
import type { IDatabase } from "../../client";

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
    expect(result).toEqual(mockCategory);
  });

  test("create() should return error validation.slugExists on duplicate key error", () => {
    mockReturning.mockRejectedValueOnce({ code: "23505" });
    expect(
      categoryService.create({
        name: "Gensets",
        slug: "gensets",
        isActive: true,
      }),
    ).rejects.toThrow("errors.validation.slugExists");
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
    expect(result).toEqual(mockCategory);
  });

  test("getById() should return category when found", async () => {
    const mockCategory = {
      id: "1",
      name: "Generators",
      slug: "generators",
      parentId: null,
      description: null,
      image: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockLimit.mockResolvedValueOnce([mockCategory]);

    const result = await categoryService.getById("1");

    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategory);
  });

  test("getById() should return undefined when not found", async () => {
    mockLimit.mockResolvedValueOnce([]);

    const result = await categoryService.getById("99");

    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
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
        name: "Parent",
        slug: "parent",
        parentId: null,
        description: null,
        image: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Child",
        slug: "child",
        parentId: "1",
        description: null,
        image: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        name: "Parent",
        slug: "parent",
        parentId: null,
        description: null,
        image: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Child 1",
        slug: "child-1",
        parentId: "1",
        description: null,
        image: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        name: "Child 2",
        slug: "child-2",
        parentId: "2",
        description: null,
        image: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockFindMany.mockResolvedValueOnce(mockCategories);

    const result = await categoryService.getCategoryDescendants("1");

    expect(result).toEqual(["1", "2", "3"]);
  });
});
