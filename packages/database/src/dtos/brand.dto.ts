import { type Brand } from "../schemas/brand.schema";

export type BrandDTO = Omit<Brand, "createdAt" | "updatedAt" | "deletedAt">;

export type BrandAdminDTO = Omit<Brand, "deletedAt">;

export function mapBrandToDTO(brand: Brand): BrandDTO {
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

export function mapBrandToAdminDTO(brand: Brand): BrandAdminDTO {
  return {
    ...mapBrandToDTO(brand),
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}
