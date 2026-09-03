import { type Category } from "../schemas/category.schema";

export type CategoryDTO = Omit<Category, "createdAt" | "updatedAt" | "deletedAt">;

export type CategoryAdminDTO = Omit<Category, "deletedAt">;

export function mapCategoryToDTO(category: Category): CategoryDTO {
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

export function mapCategoryToAdminDTO(category: Category): CategoryAdminDTO {
  return {
    ...mapCategoryToDTO(category),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
