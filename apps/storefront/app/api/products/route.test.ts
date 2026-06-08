import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock the database service
const mockGetAll = mock();
await mock.module("@nhatnang/database/services", () => ({
  productService: {
    getAll: mockGetAll,
  },
}));

describe("GET /api/products", () => {
  beforeEach(() => {
    mockGetAll.mockReset();
  });

  it("returns mapped products on success", async () => {
    const dbProducts = [
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
      },
    ];

    mockGetAll.mockResolvedValue({
      data: dbProducts,
      nextCursor: undefined,
      prevCursor: undefined,
    });

    const request = new NextRequest("http://localhost/api/products");
    const response = await GET(request);
    const json = (await response.json()) as { status: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.status).toBe(true);
    expect(json.data as unknown[]).toHaveLength(1);
    expect((json.data as unknown[])[0]).toEqual(dbProducts[0]);
  });

  it("handles errors gracefully", async () => {
    mockGetAll.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost/api/products");
    const response = await GET(request);
    const json = (await response.json()) as { status: boolean; data: unknown };

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.status).toBe(false);
    expect(json.data).toBeNull();
  });
});
