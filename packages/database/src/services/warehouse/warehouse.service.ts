import type { WarehouseService } from "../interfaces";
import { mapWarehouseToDTO, type WarehouseDTO } from "../../dtos";
import { warehouses } from "../../schemas/warehouse.schema";
import type { IDatabase } from "../../client";
import { eq } from "drizzle-orm";
import type { TCreateWarehouse, TUpdateWarehouse } from "../../validators";
import { handleServiceError } from "../../utils";

export class DbWarehouseService implements WarehouseService {
  constructor(protected readonly db: IDatabase) {}

  async getAll(): Promise<WarehouseDTO[]> {
    const allWarehouses = await this.db.query.warehouses.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return allWarehouses.map(mapWarehouseToDTO);
  }

  async getById(id: string): Promise<WarehouseDTO | undefined> {
    const [warehouse] = await this.db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, id))
      .limit(1);
    return warehouse ? mapWarehouseToDTO(warehouse) : undefined;
  }

  async create(data: TCreateWarehouse): Promise<WarehouseDTO> {
    try {
      const [newWarehouse] = await this.db
        .insert(warehouses)
        .values(data)
        .returning();
      if (!newWarehouse) {
        throw new Error("errors.createWarehouseFailed");
      }
      return mapWarehouseToDTO(newWarehouse);
    } catch (error: unknown) {
      handleServiceError(error, "errors.createWarehouseFailed");
    }
  }

  async update({ id, ...data }: TUpdateWarehouse): Promise<WarehouseDTO> {
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
      return mapWarehouseToDTO(updatedWarehouse);
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
