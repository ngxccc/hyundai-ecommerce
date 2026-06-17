import { type TProduct } from "../schemas/product.schema";

export type ProductDTO = Omit<
  TProduct,
  "totalSalesCache" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type ProductAdminDTO = Omit<TProduct, "deletedAt">;

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
    totalSalesCache: product.totalSalesCache,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
