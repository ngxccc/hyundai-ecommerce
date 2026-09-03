import { type Product } from "../schemas/product.schema";

export type ProductDTO = Omit<
  Product,
  "totalSalesCache" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type ProductAdminDTO = Omit<Product, "deletedAt">;

export function mapProductToDTO(product: Product): ProductDTO {
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

export function mapProductToAdminDTO(product: Product): ProductAdminDTO {
  return {
    ...mapProductToDTO(product),
    totalSalesCache: product.totalSalesCache,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
