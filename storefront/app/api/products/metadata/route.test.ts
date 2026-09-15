import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockGetFiltersMetadata = mock();
await mock.module("@/services", () => ({
  productService: {
    getFiltersMetadata: mockGetFiltersMetadata,
  },
}));

import { HTTP_STATUS } from "@/constants";
import { GET } from "./route";

describe("GET /api/products/metadata", () => {
  beforeEach(() => {
    mockGetFiltersMetadata.mockReset();
  });

  it("returns products filter metadata on success", async () => {
    const mockMetadata = {
      brands: [{ id: "brand-1", name: "Hyundai", count: 12 }],
      categories: [{ id: "cat-1", name: "Generators", count: 12 }],
      powerRange: { min: 5, max: 2500 },
      priceRange: { min: 10000000, max: 2000000000 },
      fuelTypes: [{ value: "diesel", count: 10 }],
      phases: [{ value: "1phase", count: 5 }],
      canopyTypes: [{ value: "silent", count: 5 }],
    };

    mockGetFiltersMetadata.mockResolvedValue(mockMetadata);

    const response = await GET(
      new Request("http://localhost/api/products/metadata?locale=en"),
    );
    const json = (await response.json()) as {
      success: boolean;
      status: boolean;
      data: typeof mockMetadata;
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.success).toBe(true);
    expect(json.status).toBe(true);
    expect(json.data).toEqual(mockMetadata);
  });

  it("handles errors gracefully", async () => {
    mockGetFiltersMetadata.mockRejectedValue(new Error("Service query failed"));

    const response = await GET(
      new Request("http://localhost/api/products/metadata"),
    );
    const json = (await response.json()) as {
      status: boolean;
      title?: string;
      detail?: string;
      instance?: string;
      data: unknown;
    };

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.status).toBe(false);
    expect(json.title).toBe("Internal Server Error");
    expect(json.detail).toBe("Failed to fetch products metadata");
    expect(json.instance).toBe("/api/products/metadata");
    expect(json.data).toBeNull();
  });
});
