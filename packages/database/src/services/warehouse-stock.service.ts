import { eq, sql } from "drizzle-orm";
import type { IDatabase } from "../client";
import { warehouseStocks } from "../schemas/warehouse-stock.schema";
import { products } from "../schemas/product.schema";
import type { IWarehouseStockService } from "./warehouse-stock.service.interface";

export class WarehouseStockService implements IWarehouseStockService {
  constructor(protected readonly db: IDatabase) {}

  async setStock(warehouseId: string, productId: string, stock: number) {
    const [record] = await this.db
      .insert(warehouseStocks)
      .values({
        warehouseId,
        productId,
        stock,
      })
      .onConflictDoUpdate({
        target: [warehouseStocks.warehouseId, warehouseStocks.productId],
        set: { stock },
      })
      .returning();

    await this.syncTotalStock(productId);

    return record;
  }

  async syncTotalStock(productId: string): Promise<void> {
    const [result] = await this.db
      .select({
        total: sql<number>`coalesce(sum(${warehouseStocks.stock}), 0)`,
      })
      .from(warehouseStocks)
      .where(eq(warehouseStocks.productId, productId));

    const totalStock = Number(result?.total ?? 0);

    await this.db
      .update(products)
      .set({ totalStockCache: totalStock })
      .where(eq(products.id, productId));
  }
}
