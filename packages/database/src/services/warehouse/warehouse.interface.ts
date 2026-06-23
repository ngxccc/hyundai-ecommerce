import type { WarehouseDTO } from "../../dtos";
import type { TCreateWarehouse, TUpdateWarehouse } from "../../validators";

export interface WarehouseService {
  getAll(): Promise<WarehouseDTO[]>;
  getById(id: string): Promise<WarehouseDTO>;
  create(data: TCreateWarehouse): Promise<WarehouseDTO>;
  update(data: TUpdateWarehouse): Promise<WarehouseDTO>;
  delete(id: string): Promise<boolean>;
}
