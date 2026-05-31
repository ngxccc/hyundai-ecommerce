import type { TWarehouseStock } from "../schemas/warehouse-stock.schema";
import type { TUpdateWarehouseStockInput } from "../validators";
import type { TActionResult } from "@nhatnang/types";

export interface IWarehouseStockService {
  /**
   * Set or update stock for a product in a specific warehouse
   */
  setStock(
    data: TUpdateWarehouseStockInput,
  ): Promise<TActionResult<TWarehouseStock>>;

  /**
   * Calculate total stock across all warehouses and sync to product.totalStockCache
   */
  syncTotalStock(productId: string): Promise<void>;
}
