import { type TBrand } from "../schemas/brand.schema";

export interface TBrandDTO {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
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
    description: brand.description,
    isActive: brand.isActive,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}
