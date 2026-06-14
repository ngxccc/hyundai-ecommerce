import { type TCategory } from "../schemas/category.schema";

export interface CategoryDTO {
  id: string;
  nameVi: string;
  nameEn: string | null;
  slug: string;
  parentId: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  image: string | null;
  isActive: boolean;
}

export interface CategoryAdminDTO extends CategoryDTO {
  createdAt: Date;
  updatedAt: Date;
}

export function mapCategoryToDTO(category: TCategory): CategoryDTO {
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
  };
}

export function mapCategoryToAdminDTO(category: TCategory): CategoryAdminDTO {
  return {
    ...mapCategoryToDTO(category),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
