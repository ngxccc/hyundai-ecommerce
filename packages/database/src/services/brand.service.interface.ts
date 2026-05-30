import type { TBrand } from "../schemas";
import type { TCreateBrandInput, TUpdateBrandInput } from "../validators";
import type { TActionResult } from "@nhatnang/types";

export interface IBrandService {
  getAll(): Promise<TBrand[]>;
  getById(id: string): Promise<TBrand | undefined>;
  create(input: TCreateBrandInput): Promise<TActionResult<TBrand>>;
  update(input: TUpdateBrandInput): Promise<TActionResult<TBrand>>;
  delete(id: string): Promise<TActionResult<boolean>>;
}
