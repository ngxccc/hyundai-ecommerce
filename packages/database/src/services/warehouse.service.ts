import type { IWarehouseService } from "./warehouse.service.interface";
import { warehouses, type TWarehouse } from "../schemas/warehouse.schema";
import type { IDatabase } from "../client";
import { eq } from "drizzle-orm";
import type {
  TCreateWarehouseInput,
  TUpdateWarehouseInput,
} from "../validators";

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
      if (
        error instanceof Error &&
        error.message === "errors.createWarehouseFailed"
      ) {
        throw error;
      }
      throw new Error("errors.createWarehouseFailed", { cause: error });
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
      if (
        error instanceof Error &&
        (error.message === "errors.warehouseNotFound" ||
          error.message === "errors.updateWarehouseFailed")
      ) {
        throw error;
      }
      throw new Error("errors.updateWarehouseFailed", { cause: error });
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
      throw new Error("errors.deleteWarehouseFailed", { cause: error });
    }
  }
}
