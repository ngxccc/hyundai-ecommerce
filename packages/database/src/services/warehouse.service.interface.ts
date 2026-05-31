import type { TWarehouse } from "../schemas/warehouse.schema";

import type {
  TCreateWarehouseInput,
  TUpdateWarehouseInput,
} from "../validators";

export interface IWarehouseService {
  getAll(): Promise<TWarehouse[]>;
  getById(id: string): Promise<TWarehouse | undefined>;
  create(data: TCreateWarehouseInput): Promise<TWarehouse>;
  update(data: TUpdateWarehouseInput): Promise<TWarehouse>;
  delete(id: string): Promise<boolean>;
}
