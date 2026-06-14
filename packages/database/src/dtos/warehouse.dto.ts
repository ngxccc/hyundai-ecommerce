import { type TWarehouse } from "../schemas/warehouse.schema";

export interface WarehouseDTO {
  id: string;
  nameVi: string;
  nameEn: string | null;
  streetAddress: string;
  district: string;
  city: string;
  isActive: boolean;
}

export interface WarehouseAdminDTO extends WarehouseDTO {
  createdAt: Date;
  updatedAt: Date;
}

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
