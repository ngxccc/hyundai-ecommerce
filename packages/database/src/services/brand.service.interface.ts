import type { TBrand } from "../schemas";
import type { TCreateBrandInput, TUpdateBrandInput } from "../validators";


export interface IBrandService {
  getAll(): Promise<TBrand[]>;
  getById(id: string): Promise<TBrand | undefined>;
  create(input: TCreateBrandInput): Promise<TBrand>;
  update(input: TUpdateBrandInput): Promise<TBrand>;
  delete(id: string): Promise<boolean>;
}
