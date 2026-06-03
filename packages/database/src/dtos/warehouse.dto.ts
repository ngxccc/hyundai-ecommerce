import { type TWarehouse } from "../schemas/warehouse.schema";

export interface TWarehouseDTO {
  id: string;
  name: string;
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
    name: warehouse.name,
    streetAddress: warehouse.streetAddress,
    district: warehouse.district,
    city: warehouse.city,
    isActive: warehouse.isActive,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  };
}
