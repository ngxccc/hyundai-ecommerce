import type { TNewProduct, TProduct } from "../schemas";

export type TUpdateProductData = Partial<{
  [K in keyof TNewProduct]: TNewProduct[K] | undefined;
}>;

export interface IProductService {
  create(data: TNewProduct): Promise<TProduct | undefined>;
  update(id: string, data: TUpdateProductData): Promise<TProduct | undefined>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<TProduct | undefined>;
  getAll(limit?: number, cursor?: { after?: string; before?: string }): unknown;
}
