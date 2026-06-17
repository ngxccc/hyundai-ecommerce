import { type TBrand } from "../schemas/brand.schema";

export type BrandDTO = Omit<TBrand, "createdAt" | "updatedAt" | "deletedAt">;

export type BrandAdminDTO = Omit<TBrand, "deletedAt">;

export function mapBrandToDTO(brand: TBrand): BrandDTO {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    descriptionVi: brand.descriptionVi,
    descriptionEn: brand.descriptionEn,
    isActive: brand.isActive,
  };
}

export function mapBrandToAdminDTO(brand: TBrand): BrandAdminDTO {
  return {
    ...mapBrandToDTO(brand),
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}
