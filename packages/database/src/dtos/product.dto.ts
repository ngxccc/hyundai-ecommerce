import type { JSONContent } from "@nhatnang/ui";
import { type TProduct } from "../schemas/product.schema";
import type { TProductSpecs } from "../validators";

export interface ProductDTO {
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
}

export interface ProductAdminDTO extends ProductDTO {
  createdAt: Date;
  updatedAt: Date;
}

export function mapProductToDTO(product: TProduct): ProductDTO {
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
  };
}

export function mapProductToAdminDTO(product: TProduct): ProductAdminDTO {
  return {
    ...mapProductToDTO(product),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
