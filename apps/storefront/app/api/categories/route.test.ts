import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock the database service
const mockGetAll = mock();
const mockGetCategoryTree = mock();
await mock.module("@nhatnang/database/services", () => ({
  categoryService: {
    getAll: mockGetAll,
    getCategoryTree: mockGetCategoryTree,
  },
}));

describe("GET /api/categories", () => {
  beforeEach(() => {
    mockGetAll.mockReset();
    mockGetCategoryTree.mockReset();
  });

  it("returns mapped categories on success", async () => {
    const dbCategories = [
      {
        id: "cat-1",
        slug: "industrial",
        name: "Industrial Power",
        image: "/images/industrial.jpg",
        description: "Industrial diesel generators",
      },
    ];

    mockGetAll.mockResolvedValue(dbCategories);

    const response = await GET(
      new NextRequest("http://localhost/api/categories"),
    );
    const json = (await response.json()) as { status: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.status).toBe(true);
    expect(json.data as unknown[]).toHaveLength(1);
    expect((json.data as unknown[])[0]).toEqual(dbCategories[0]);
  });

  it("handles errors gracefully", async () => {
    mockGetAll.mockRejectedValue(new Error("Database error"));

    const response = await GET(
      new NextRequest("http://localhost/api/categories"),
    );
    const json = (await response.json()) as { status: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.status).toBe(false);
    expect(json.data).toBeNull();
  });

  it("returns category tree when tree query param is true", async () => {
    const mockTree = [
      {
        id: "cat-1",
        slug: "industrial",
        name: "Industrial Power",
        children: [],
      },
    ];

    mockGetCategoryTree.mockResolvedValue(mockTree);

    const response = await GET(
      new NextRequest("http://localhost/api/categories?tree=true"),
    );
    const json = (await response.json()) as { status: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.status).toBe(true);
    expect(json.data as unknown[]).toHaveLength(1);
    expect((json.data as unknown[])[0]).toEqual(mockTree[0]);
  });
});
