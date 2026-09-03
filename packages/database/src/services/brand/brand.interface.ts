import type { BrandDTO } from "../../schemas";
import type { CreateBrandInput, UpdateBrandInput } from "../../validators";

export interface BrandService {
  getAll(): Promise<BrandDTO[]>;
  getById(id: string): Promise<BrandDTO>;
  create(input: CreateBrandInput): Promise<BrandDTO>;
  update(input: UpdateBrandInput): Promise<BrandDTO>;
  delete(id: string): Promise<boolean>;
}
