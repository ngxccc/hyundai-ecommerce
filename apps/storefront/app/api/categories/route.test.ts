import { beforeEach, describe, expect, it, mock } from "bun:test";
import { GET } from "./route";

// Mock the database service
const mockGetAll = mock();
mock.module("@nhatnang/database/services", () => ({
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
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0]).toEqual({
      id: "cat-1",
      slug: "industrial",
      name: "Industrial Power",
      imageUrl: "/images/industrial.jpg",
      description: "Industrial diesel generators",
    });
  });

  it("handles errors gracefully", async () => {
    mockGetAll.mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.status).toBe(false);
    expect(json.data).toBeNull();
  });
});
