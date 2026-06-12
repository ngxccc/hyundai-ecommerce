import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockGetCategories = mock();
await mock.module("@/shared/services", () => ({
  categoryService: {
    getCategories: mockGetCategories,
  },
}));

import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { GET } from "./route";

describe("GET /api/categories", () => {
  beforeEach(() => {
    mockGetCategories.mockReset();
  });

  it("returns mapped categories on success", async () => {
    const dbCategories = [
      {
        id: "cat-1",
        slug: "industrial",
        name: "Industrial Power",
        image: "/images/industrial.jpg",
        description: "Industrial diesel generators",
        isActive: true,
      },
    ];

    mockGetCategories.mockResolvedValue(dbCategories);

    const response = await GET(new Request("http://localhost/api/categories?locale=en"));
    const json = (await response.json()) as { status: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.status).toBe(true);
    expect(json.data as unknown[]).toHaveLength(1);
    expect((json.data as unknown[])[0]).toEqual(dbCategories[0]);
  });

  it("handles errors gracefully", async () => {
    mockGetCategories.mockRejectedValue(new Error("Service error"));

    const response = await GET(new Request("http://localhost/api/categories"));
    const json = (await response.json()) as { status: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.status).toBe(false);
    expect(json.data).toEqual([]);
  });
});
