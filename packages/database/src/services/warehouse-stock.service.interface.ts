import type { TWarehouseStock } from "../schemas/warehouse-stock.schema";

export interface IWarehouseStockService {
  /**
   * Set or update stock for a product in a specific warehouse
   */
  setStock(
    warehouseId: string,
    productId: string,
    stock: number,
  ): Promise<TWarehouseStock | undefined>;

  /**
   * Calculate total stock across all warehouses and sync to product.totalStockCache
   */
  syncTotalStock(productId: string): Promise<void>;
}
