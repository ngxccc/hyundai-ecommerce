import { eq, sql } from "drizzle-orm";
import type { IDatabase } from "../client";
import { warehouseStocks } from "../schemas/warehouse-stock.schema";
import { products } from "../schemas/product.schema";
import type { IWarehouseStockService } from "./interfaces";
import type { TUpdateWarehouseStockInput } from "../validators";

export class WarehouseStockService implements IWarehouseStockService {
  constructor(protected readonly db: IDatabase) {}

  async setStock(
    stockData: TUpdateWarehouseStockInput,
  ): Promise<typeof warehouseStocks.$inferSelect> {
    try {
      const [record] = await this.db
        .insert(warehouseStocks)
        .values(stockData)
        .onConflictDoUpdate({
          target: [warehouseStocks.warehouseId, warehouseStocks.productId],
          set: {
            stock: stockData.stock,
            minStockWarning: stockData.minStockWarning,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (!record) {
        throw new Error("errors.updateWarehouseStockFailed");
      }

      await this.syncTotalStock(stockData.productId);

      return record;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "errors.updateWarehouseStockFailed"
      ) {
        throw error;
      }
      throw new Error("errors.updateWarehouseStockFailed", { cause: error });
    }
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

  async getByProductId(productId: string): Promise<typeof warehouseStocks.$inferSelect[]> {
    return this.db
      .select()
      .from(warehouseStocks)
      .where(eq(warehouseStocks.productId, productId));
  }
}
