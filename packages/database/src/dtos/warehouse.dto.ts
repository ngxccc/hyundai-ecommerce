import { type TWarehouse } from "../schemas/warehouse.schema";

export interface TWarehouseDTO {
  id: string;
  nameVi: string;
  nameEn: string | null;
  streetAddress: string;
  district: string;
  city: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function mapWarehouseToDTO(warehouse: TWarehouse): TWarehouseDTO {
  return {
    id: warehouse.id,
    nameVi: warehouse.nameVi,
    nameEn: warehouse.nameEn,
    streetAddress: warehouse.streetAddress,
    district: warehouse.district,
    city: warehouse.city,
    isActive: warehouse.isActive,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  };
}
