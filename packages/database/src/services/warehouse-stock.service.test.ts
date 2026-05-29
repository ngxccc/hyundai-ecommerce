import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockInsert,
  mockUpdate,
  mockReturning,
  mockSelect,
  mockFrom,
  mockWhere,
  mockOnConflictDoUpdate,
} from "../tests/utils/db-mock";
import { WarehouseStockService } from "./warehouse-stock.service";
import type { IDatabase } from "../client";

const warehouseStockService = new WarehouseStockService(
  mockDb as unknown as IDatabase,
);

describe("WarehouseStockService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("setStock() should insert/update stock and sync total", async () => {
    const mockRecord = { warehouseId: "w-1", productId: "p-1", stock: 10 };
    // For .insert().returning()

    mockReturning.mockResolvedValueOnce([mockRecord]);

    // For syncTotalStock select().from().where()

    mockWhere.mockResolvedValueOnce([{ total: 10 }]);

    // For syncTotalStock update().set().where()

    mockWhere.mockResolvedValueOnce([]);

    const result = await warehouseStockService.setStock("w-1", "p-1", 10);

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockOnConflictDoUpdate).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(result).toEqual(mockRecord as any);
  });
});
