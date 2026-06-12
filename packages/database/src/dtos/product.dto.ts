import type { JSONContent } from "@tiptap/core";
import { type TProduct } from "../schemas/product.schema";
import type { TProductSpecs } from "../validators";

export interface TProductDTO {
  id: string;
  nameVi: string;
  nameEn: string | null;
  slug: string;
  price: string;
  descriptionVi: JSONContent | null;
  descriptionEn: JSONContent | null;
  shortDescriptionVi: string | null;
  shortDescriptionEn: string | null;
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
    nameVi: product.nameVi,
    nameEn: product.nameEn,
    slug: product.slug,
    price: product.price,
    descriptionVi: product.descriptionVi,
    descriptionEn: product.descriptionEn,
    shortDescriptionVi: product.shortDescriptionVi,
    shortDescriptionEn: product.shortDescriptionEn,
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
