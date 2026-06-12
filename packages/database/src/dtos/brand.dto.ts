import { type TBrand } from "../schemas/brand.schema";

export interface TBrandDTO {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function mapBrandToDTO(brand: TBrand): TBrandDTO {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    descriptionVi: brand.descriptionVi,
    descriptionEn: brand.descriptionEn,
    isActive: brand.isActive,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}
