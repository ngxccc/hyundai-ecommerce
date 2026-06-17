import { type TCategory } from "../schemas/category.schema";

export type CategoryDTO = Omit<TCategory, "createdAt" | "updatedAt" | "deletedAt">;

export type CategoryAdminDTO = Omit<TCategory, "deletedAt">;

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
