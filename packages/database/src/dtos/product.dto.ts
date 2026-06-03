import { type TProduct } from "../schemas/product.schema";
import type { TProductSpecs } from "../validators";

export interface TProductDTO {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: Record<string, unknown> | null;
  shortDescription: string | null;
  images: string[];
  brandId: string | null;
  categoryId: string | null;
  specs: TProductSpecs | null;
  totalStockCache: number;
  isQuoteOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function mapProductToDTO(product: TProduct): TProductDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    description: product.description,
    shortDescription: product.shortDescription,
    images: product.images,
    brandId: product.brandId,
    categoryId: product.categoryId,
    specs: product.specs,
    totalStockCache: product.totalStockCache,
    isQuoteOnly: product.isQuoteOnly,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
