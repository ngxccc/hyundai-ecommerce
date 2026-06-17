import { type TWarehouse } from "../schemas/warehouse.schema";

export type WarehouseDTO = Omit<TWarehouse, "createdAt" | "updatedAt" | "deletedAt">;

export type WarehouseAdminDTO = Omit<TWarehouse, "deletedAt">;

export function mapWarehouseToDTO(warehouse: TWarehouse): WarehouseDTO {
  return {
    id: warehouse.id,
    nameVi: warehouse.nameVi,
    nameEn: warehouse.nameEn,
    streetAddress: warehouse.streetAddress,
    district: warehouse.district,
    city: warehouse.city,
    isActive: warehouse.isActive,
  };
}

export function mapWarehouseToAdminDTO(
  warehouse: TWarehouse,
): WarehouseAdminDTO {
  return {
    ...mapWarehouseToDTO(warehouse),
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  };
}
