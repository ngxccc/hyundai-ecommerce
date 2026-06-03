import { type TCategory } from "../schemas/category.schema";

export interface TCategoryDTO {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function mapCategoryToDTO(category: TCategory): TCategoryDTO {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    description: category.description,
    image: category.image,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
