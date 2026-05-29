import { expect, test, describe, vi, beforeEach } from "bun:test";
import { mockDb, mockSelect, mockFrom } from "../tests/utils/db-mock";
import { CategoryService } from "./category.service";
import type { IDatabase } from "../client";
import { categories } from "../schemas";

const categoryService = new CategoryService(mockDb as unknown as IDatabase);

describe("CategoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAll() should return a list of categories using select().from()", async () => {
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

    mockFrom.mockResolvedValueOnce(mockCategories);

    const result = await categoryService.getAll();

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith(categories);

    expect(result).toEqual(mockCategories);
  });
});
