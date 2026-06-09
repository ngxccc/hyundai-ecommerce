import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { GET } from "./route";

// Mock the database service
const mockGetAll = mock();
await mock.module("@nhatnang/database/services", () => ({
  categoryService: {
    getAll: mockGetAll,
  },
}));

describe("GET /api/categories", () => {
  beforeEach(() => {
    mockGetAll.mockReset();
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

    const response = await GET();
    const json = (await response.json()) as { success: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.success).toBe(true);
    expect(json.data as unknown[]).toHaveLength(1);
    expect((json.data as unknown[])[0]).toEqual(dbCategories[0]);
  });

  it("handles errors gracefully", async () => {
    mockGetAll.mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const json = (await response.json()) as { success: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.success).toBe(false);
    expect(json.data).toBeNull();
  });
});
