import type { TWarehouseStock } from "../schemas/warehouse-stock.schema";
import type { TUpdateWarehouseStockInput } from "../validators";


export interface IWarehouseStockService {
  /**
   * Set or update stock for a product in a specific warehouse
   */
  setStock(
    stockData: TUpdateWarehouseStockInput,
  ): Promise<TWarehouseStock>;

  /**
   * Calculate total stock across all warehouses and sync to product.totalStockCache
   */
  syncTotalStock(productId: string): Promise<void>;
}
