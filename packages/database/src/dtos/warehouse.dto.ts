import { type Warehouse } from "../schemas/warehouse.schema";

export type WarehouseDTO = Omit<Warehouse, "createdAt" | "updatedAt" | "deletedAt">;

export type WarehouseAdminDTO = Omit<Warehouse, "deletedAt">;

export function mapWarehouseToDTO(warehouse: Warehouse): WarehouseDTO {
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
  warehouse: Warehouse,
): WarehouseAdminDTO {
  return {
    ...mapWarehouseToDTO(warehouse),
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  };
}
