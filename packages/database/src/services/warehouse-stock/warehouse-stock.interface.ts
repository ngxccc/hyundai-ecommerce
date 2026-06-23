import type { TWarehouseStock } from "../../schemas";
import type { TUpdateWarehouseStockInput } from "../../validators";

export interface WarehouseStockService {
  setStock(stockData: TUpdateWarehouseStockInput): Promise<TWarehouseStock>;
  syncTotalStock(productId: string): Promise<void>;
  getByProductId(productId: string): Promise<TWarehouseStock[]>;
}
