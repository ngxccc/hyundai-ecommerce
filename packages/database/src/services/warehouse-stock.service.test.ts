import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockInsert,
  mockUpdate,
  mockReturning,
  mockWhere,
  mockSelect,
} from "../tests/utils/db-mock";
import { WarehouseStockService } from "./warehouse-stock.service";
import type { IDatabase } from "../client";

const warehouseStockService = new WarehouseStockService(mockDb as unknown as IDatabase);

describe("WarehouseStockService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("setStock() should upsert stock and sync total", async () => {
    const mockStockRecord = {
      warehouseId: "w1",
      productId: "p1",
      stock: 50,
      minStockWarning: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // For setStock
    mockReturning.mockResolvedValueOnce([mockStockRecord]);
    
    // For syncTotalStock
    mockWhere.mockResolvedValueOnce([{ total: 50 }]);

    const result = await warehouseStockService.setStock({
      warehouseId: "w1",
      productId: "p1",
      stock: 50,
      minStockWarning: 10,
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    
    // Check syncTotalStock calls
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(2);

    expect(result).toEqual(mockStockRecord);
  });
});
