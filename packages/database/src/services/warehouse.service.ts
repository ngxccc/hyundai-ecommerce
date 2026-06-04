import type { IWarehouseService } from "./interfaces";
import { warehouses, type TWarehouse } from "../schemas/warehouse.schema";
import type { IDatabase } from "../client";
import { eq } from "drizzle-orm";
import type {
  TCreateWarehouseInput,
  TUpdateWarehouseInput,
} from "../validators";
import { handleServiceError } from "../utils";

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

  async create(data: TCreateWarehouseInput): Promise<TWarehouse> {
    try {
      const [newWarehouse] = await this.db
        .insert(warehouses)
        .values(data)
        .returning();
      if (!newWarehouse) {
        throw new Error("errors.createWarehouseFailed");
      }
      return newWarehouse;
    } catch (error: unknown) {
      handleServiceError(error, "errors.createWarehouseFailed");
    }
  }

  async update({ id, ...data }: TUpdateWarehouseInput): Promise<TWarehouse> {
    try {
      if (!id) {
        throw new Error("errors.warehouseNotFound");
      }
      const [updatedWarehouse] = await this.db
        .update(warehouses)
        .set(data)
        .where(eq(warehouses.id, id))
        .returning();
      if (!updatedWarehouse) {
        throw new Error("errors.warehouseNotFound");
      }
      return updatedWarehouse;
    } catch (error: unknown) {
      handleServiceError(error, "errors.updateWarehouseFailed");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db
        .update(warehouses)
        .set({ isActive: false })
        .where(eq(warehouses.id, id));
      return true;
    } catch (error: unknown) {
      handleServiceError(error, "errors.deleteWarehouseFailed");
    }
  }
}
