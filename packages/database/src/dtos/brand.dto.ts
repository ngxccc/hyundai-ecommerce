import { type TBrand } from "../schemas/brand.schema";

export interface BrandDTO {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  isActive: boolean;
}

export interface BrandAdminDTO extends BrandDTO {
  createdAt: Date;
  updatedAt: Date;
}
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
