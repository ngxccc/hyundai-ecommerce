import type { BrandDTO } from "../../dtos";
import type { TCreateBrandInput, TUpdateBrandInput } from "../../validators";

export interface BrandService {
  getAll(): Promise<BrandDTO[]>;
  getById(id: string): Promise<BrandDTO>;
  create(input: TCreateBrandInput): Promise<BrandDTO>;
  update(input: TUpdateBrandInput): Promise<BrandDTO>;
  delete(id: string): Promise<boolean>;
}
