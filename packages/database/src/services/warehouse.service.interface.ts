import type { TWarehouse } from "../schemas/warehouse.schema";
import type { TActionResult } from "@nhatnang/types";
import type {
  TCreateWarehouseInput,
  TUpdateWarehouseInput,
} from "../validators";

export interface IWarehouseService {
  getAll(): Promise<TWarehouse[]>;
  getById(id: string): Promise<TWarehouse | undefined>;
  create(data: TCreateWarehouseInput): Promise<TActionResult<TWarehouse>>;
  update(data: TUpdateWarehouseInput): Promise<TActionResult<TWarehouse>>;
  delete(id: string): Promise<TActionResult<boolean>>;
}
