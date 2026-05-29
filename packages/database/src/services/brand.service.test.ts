import { expect, test, describe, vi, beforeEach } from "bun:test";
import { mockDb, mockFindMany } from "../tests/utils/db-mock";
import { BrandService } from "./brand.service";
import type { IDatabase } from "../client";

const brandService = new BrandService(mockDb as unknown as IDatabase);

describe("BrandService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAll() should return a list of brands", async () => {
    const mockBrands = [
      {
        id: "1",
        name: "Hyundai",
        slug: "hyundai",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: "2",
        name: "Honda",
        slug: "honda",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    mockFindMany.mockResolvedValueOnce(mockBrands);

    const result = await brandService.getAll();

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "desc",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(result).toEqual(mockBrands as any);
  });
});
