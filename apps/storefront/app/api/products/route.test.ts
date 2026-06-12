import { beforeEach, describe, expect, it, mock } from "bun:test";

await mock.module("next/server", () => ({
  connection: mock().mockResolvedValue(undefined),
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: () => Promise.resolve(body),
      status: init?.status ?? 200,
    }),
  },
  NextRequest: class {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  },
}));

const mockGetProducts = mock();
const mockGetCategories = mock();
const mockGetBrands = mock();

await mock.module("@/shared/services", () => ({
  productService: {
    getProducts: mockGetProducts,
  },
  categoryService: {
    getCategories: mockGetCategories,
    getCategoryDescendants: mock().mockResolvedValue([]),
  },
  brandService: {
    getBrands: mockGetBrands,
  },
}));

import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("GET /api/products", () => {
  beforeEach(() => {
    mockGetProducts.mockReset();
    mockGetCategories.mockReset();
    mockGetBrands.mockReset();
  });

  it("returns mapped products on success", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        name: "Hyundai Pump",
        slug: "hyundai-pump",
        price: "12500000.00",
        images: ["/images/pump1.jpg"],
        specs: {
          power: 3.5,
          fuelType: "Gasoline",
        },
        description: null,
        shortDescription: null,
        brandId: null,
        categoryId: null,
        totalStockCache: 10,
        isQuoteOnly: false,
      },
    ];

    mockGetProducts.mockResolvedValue({
      data: mockProducts,
      nextCursor: undefined,
      prevCursor: undefined,
      hasMore: false,
    });

    const request = new NextRequest("http://localhost/api/products");
    const response = await GET(request);
    const json = (await response.json()) as {
      status: boolean;
      data: { data: typeof mockProducts };
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.status).toBe(true);
    expect(json.data.data).toHaveLength(1);
    expect(json.data.data[0]).toEqual(mockProducts[0]);
  });

  it("handles errors gracefully", async () => {
    mockGetProducts.mockRejectedValue(new Error("Service error"));

    const request = new NextRequest("http://localhost/api/products");
    const response = await GET(request);
    const json = (await response.json()) as { status: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.status).toBe(false);
    expect(json.data).toBeNull();
  });
});
