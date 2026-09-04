import { beforeEach, describe, expect, it, mock } from "bun:test";

await mock.module("next/server", () => {
  class MockNextResponse extends Response {
    public static override json(
      body: unknown,
      init?: { status?: number; headers?: HeadersInit },
    ) {
      return new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { "Content-Type": "application/json", ...init?.headers },
      });
    }
  }

  class MockNextRequest extends Request {
    public nextUrl: URL;
    constructor(input: string | URL, init?: RequestInit) {
      super(input.toString(), init);
      this.nextUrl = new URL(input.toString());
    }
  }

  return {
    connection: mock().mockResolvedValue(undefined),
    NextResponse: MockNextResponse,
    NextRequest: MockNextRequest,
  };
});

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

import { HTTP_STATUS } from "@/shared/constants";
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
      success: boolean;
      status: boolean;
      data: { data: typeof mockProducts };
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.success).toBe(true);
    expect(json.status).toBe(true);
    expect(json.data.data).toHaveLength(1);
    expect(json.data.data[0]).toEqual(mockProducts[0]);
  });

  it("handles errors gracefully", async () => {
    mockGetProducts.mockRejectedValue(new Error("Service error"));

    const request = new NextRequest("http://localhost/api/products");
    const response = await GET(request);
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
    expect(json.detail).toBe("Failed to fetch products");
    expect(json.instance).toBe("/api/products");
    expect(json.data).toBeNull();
  });
});
