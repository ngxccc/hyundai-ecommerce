import type { WarehouseStock } from "../../schemas";
import type { UpdateWarehouseStockInput } from "../../validators";

export interface WarehouseStockService {
  setStock(stockData: UpdateWarehouseStockInput): Promise<WarehouseStock>;
  syncTotalStock(productId: string): Promise<void>;
  getByProductId(productId: string): Promise<WarehouseStock[]>;
}
