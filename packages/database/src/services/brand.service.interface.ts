import type { TBrand } from "../schemas";

export interface IBrandService {
  getAll(): Promise<TBrand[]>;
}
