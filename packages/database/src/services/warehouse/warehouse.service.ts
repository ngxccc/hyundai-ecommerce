import type { WarehouseService } from "../interfaces";
import { type WarehouseDTO } from "../../dtos";
import { warehouses } from "../../schemas/warehouse.schema";
import type { IDatabase } from "../../client";
import { eq } from "drizzle-orm";
import type { TCreateWarehouse, TUpdateWarehouse } from "../../validators";
import { handleServiceError } from "../../utils";

export class DbWarehouseService implements WarehouseService {
  constructor(protected readonly db: IDatabase) {}

  async getAll(): Promise<WarehouseDTO[]> {
    return this.db.query.warehouses.findMany({
      columns: {
        id: true,
        nameVi: true,
        nameEn: true,
        streetAddress: true,
        district: true,
        city: true,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getById(id: string): Promise<WarehouseDTO> {
    const [warehouse] = await this.db
      .select({
        id: warehouses.id,
        nameVi: warehouses.nameVi,
        nameEn: warehouses.nameEn,
        streetAddress: warehouses.streetAddress,
        district: warehouses.district,
        city: warehouses.city,
        isActive: warehouses.isActive,
      })
      .from(warehouses)
      .where(eq(warehouses.id, id))
      .limit(1);
    if (!warehouse) throw new Error("errors.warehouseNotFound");
    return warehouse;
  }

  async create(data: TCreateWarehouse): Promise<WarehouseDTO> {
    try {
      const [newWarehouse] = await this.db
        .insert(warehouses)
        .values(data)
        .returning({
          id: warehouses.id,
          nameVi: warehouses.nameVi,
          nameEn: warehouses.nameEn,
          streetAddress: warehouses.streetAddress,
          district: warehouses.district,
          city: warehouses.city,
          isActive: warehouses.isActive,
        });
      if (!newWarehouse) {
        throw new Error("errors.createWarehouseFailed");
      }
      return newWarehouse;
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
        .returning({
          id: warehouses.id,
          nameVi: warehouses.nameVi,
          nameEn: warehouses.nameEn,
          streetAddress: warehouses.streetAddress,
          district: warehouses.district,
          city: warehouses.city,
          isActive: warehouses.isActive,
        });
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
