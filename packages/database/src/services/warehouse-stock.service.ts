import { eq, sql } from "drizzle-orm";
import type { IDatabase } from "../client";
import { warehouseStocks } from "../schemas/warehouse-stock.schema";
import { products } from "../schemas/product.schema";
import type { IWarehouseStockService } from "./warehouse-stock.service.interface";
import type { TUpdateWarehouseStockInput } from "../validators";
import type { TActionResult } from "@nhatnang/types";

export class WarehouseStockService implements IWarehouseStockService {
  constructor(protected readonly db: IDatabase) {}

  async setStock(
    input: TUpdateWarehouseStockInput,
  ): Promise<TActionResult<typeof warehouseStocks.$inferSelect>> {
    try {
      const [record] = await this.db
        .insert(warehouseStocks)
        .values(input)
        .onConflictDoUpdate({
          target: [warehouseStocks.warehouseId, warehouseStocks.productId],
          set: {
            stock: input.stock,
            minStockWarning: input.minStockWarning,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (!record) {
        return {
          success: false,
          code: "INTERNAL_SERVER_ERROR",
          error: "errors.updateWarehouseStockFailed",
        };
      }

      await this.syncTotalStock(input.productId);

      return { success: true, data: record };
    } catch {
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        error: "errors.updateWarehouseStockFailed",
      };
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
}
