import { type TCategory } from "../schemas/category.schema";

export interface TCategoryDTO {
  id: string;
  nameVi: string;
  nameEn: string | null;
  slug: string;
  parentId: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function mapCategoryToDTO(category: TCategory): TCategoryDTO {
  return {
    id: category.id,
    nameVi: category.nameVi,
    nameEn: category.nameEn,
    slug: category.slug,
    parentId: category.parentId,
    descriptionVi: category.descriptionVi,
    descriptionEn: category.descriptionEn,
    image: category.image,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
