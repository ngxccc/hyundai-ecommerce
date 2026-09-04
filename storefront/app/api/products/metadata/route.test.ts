import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockGetFiltersMetadata = mock();
await mock.module("@/shared/services", () => ({
  productService: {
    getFiltersMetadata: mockGetFiltersMetadata,
  },
}));

import { HTTP_STATUS } from "@/shared/constants";
import { GET } from "./route";

describe("GET /api/products/metadata", () => {
  beforeEach(() => {
    mockGetFiltersMetadata.mockReset();
  });

  it("returns products filter metadata on success", async () => {
    const mockMetadata = [
      {
        id: "prod-1",
        name: "Hyundai Generator",
        categoryId: "cat-1",
        brandId: "brand-1",
        specs: {
          power: 10.5,
          voltage: 220,
          phase: "1phase",
          fuelType: "diesel",
          engineBrand: "Hyundai",
          alternatorBrand: "Hyundai",
        },
      },
    ];

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
    expect(json.data).toHaveLength(1);
    expect(json.data[0]).toEqual(mockMetadata[0]);
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
