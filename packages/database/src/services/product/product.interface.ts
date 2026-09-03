import type { NewProduct, ProductDTO } from "../../schemas";

export interface TopSellingProduct {
  id: string;
  nameVi: string;
  nameEn: string | null;
  sold: number;
  price: string;
  image: string | null;
}

export type UpdateProductData = Partial<{
  [K in keyof NewProduct]: NewProduct[K] | undefined;
}>;

export interface GetAllOptions {
  after?: string | undefined;
  before?: string | undefined;
  categoryId?: string | undefined;
  categoryIds?: string[] | undefined;
  brandId?: string | undefined;
  brandIds?: string[] | undefined;
  status?: "active" | "outOfStock" | undefined;
  search?: string | undefined;
  productType?: string | undefined;
  fuelType?: string | undefined;
  phase?: string | undefined;
  voltage?: number | string | undefined;
  minPower?: number | undefined;
  maxPower?: number | undefined;
  engineBrand?: string | undefined;
  alternatorBrand?: string | undefined;
  canopyType?: string | undefined;
  upsTopology?: string | undefined;
  isQuoteOnly?: boolean | undefined;
  sort?: "priceAsc" | "priceDesc" | "newest" | undefined;
}

export interface ProductFilterSpecs {
  power?: number | null;
  voltage?: number | null;
  phase?: "1phase" | "3phase" | null;
  fuelType?: "diesel" | "gasoline" | "gas" | null;
  engineBrand?: string | null;
  model?: string | null;
  alternatorBrand?: string | null;
}

export interface ProductFilterMetadata {
  id: string;
  nameVi: string;
  nameEn: string | null;
  categoryId: string | null;
  brandId: string | null;
  specs: ProductFilterSpecs | null;
}

export interface LocalItem {
  productId: string;
  quantity: number;
}

export interface ProductService {
  create(data: NewProduct): Promise<ProductDTO>;
  update(id: string, data: UpdateProductData): Promise<ProductDTO>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<ProductDTO>;
  getAll(
    limit?: number,
    options?: GetAllOptions,
  ): Promise<{
    data: ProductDTO[];
    hasMore: boolean;
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
  }>;
  getTopSellingProducts(limit: number): Promise<TopSellingProduct[]>;
  getFiltersMetadata(): Promise<ProductFilterMetadata[]>;
  getAllActiveSlugs(): Promise<string[]>;
  getActiveProductBySlug(slug: string): Promise<ProductDTO | null>;
}
