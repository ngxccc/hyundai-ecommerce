import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { GET } from "./route";

// Mock the database service
const mockGetFiltersMetadata = mock();
await mock.module("@nhatnang/database/services", () => ({
  productService: {
    getFiltersMetadata: mockGetFiltersMetadata,
  },
}));

describe("GET /api/products/metadata", () => {
  beforeEach(() => {
    mockGetFiltersMetadata.mockReset();
  });

  it("returns products filter metadata on success", async () => {
    const mockMetadata = [
      {
        id: "prod-1",
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

    const response = await GET();
    const json = (await response.json()) as {
      status: boolean;
      data: typeof mockMetadata;
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.status).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0]).toEqual(mockMetadata[0]);
  });

  it("handles errors gracefully", async () => {
    mockGetFiltersMetadata.mockRejectedValue(
      new Error("Database query failed"),
    );

    const response = await GET();
    const json = (await response.json()) as { status: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.status).toBe(false);
    expect(json.data).toBeNull();
  });
});
