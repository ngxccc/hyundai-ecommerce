import type { WarehouseDTO } from "../../dtos";
import type { CreateWarehouseInput, UpdateWarehouseInput } from "../../validators";

export interface WarehouseService {
  getAll(): Promise<WarehouseDTO[]>;
  getById(id: string): Promise<WarehouseDTO>;
  create(data: CreateWarehouseInput): Promise<WarehouseDTO>;
  update(data: UpdateWarehouseInput): Promise<WarehouseDTO>;
  delete(id: string): Promise<boolean>;
}
