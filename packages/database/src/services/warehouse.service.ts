import type { IWarehouseService } from "./warehouse.service.interface";
import { warehouses, type TWarehouse } from "../schemas/warehouse.schema";
import type { IDatabase } from "../client";
import { eq } from "drizzle-orm";
import type {
  TCreateWarehouseInput,
  TUpdateWarehouseInput,
} from "../validators";
import type { TActionResult } from "@nhatnang/types";

export class WarehouseService implements IWarehouseService {
  constructor(protected readonly db: IDatabase) {}

  async getAll(): Promise<TWarehouse[]> {
    return this.db.query.warehouses.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getById(id: string): Promise<TWarehouse | undefined> {
    const [warehouse] = await this.db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, id))
      .limit(1);
    return warehouse;
  }

  async create(
    input: TCreateWarehouseInput,
  ): Promise<TActionResult<TWarehouse>> {
    try {
      const [newWarehouse] = await this.db
        .insert(warehouses)
        .values(input)
        .returning();
      if (!newWarehouse)
        return {
          success: false,
          code: "INTERNAL_SERVER_ERROR",
          error: "errors.createWarehouseFailed",
        };
      return { success: true, data: newWarehouse };
    } catch {
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        error: "errors.createWarehouseFailed",
      };
    }
  }

  async update({
    id,
    ...data
  }: TUpdateWarehouseInput): Promise<TActionResult<TWarehouse>> {
    try {
      if (!id) {
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: "errors.warehouseNotFound",
        };
      }
      const [updatedWarehouse] = await this.db
        .update(warehouses)
        .set(data)
        .where(eq(warehouses.id, id))
        .returning();
      if (!updatedWarehouse)
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: "errors.warehouseNotFound",
        };
      return { success: true, data: updatedWarehouse };
    } catch {
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        error: "errors.updateWarehouseFailed",
      };
    }
  }

  async delete(id: string): Promise<TActionResult<boolean>> {
    try {
      await this.db
        .update(warehouses)
        .set({ isActive: false })
        .where(eq(warehouses.id, id));
      return { success: true, data: true };
    } catch {
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        error: "errors.deleteWarehouseFailed",
      };
    }
  }
}
