import type { CategoryDTO } from "../../dtos";
import type { TCreateCategoryInput, TUpdateCategoryInput } from "../../validators";

export type TCategoryWithChildren = CategoryDTO & {
  children?: TCategoryWithChildren[];
};

export interface CategoryService {
  getAll(): Promise<CategoryDTO[]>;
  getById(id: string): Promise<CategoryDTO>;
  create(input: TCreateCategoryInput): Promise<CategoryDTO>;
  update(input: TUpdateCategoryInput): Promise<CategoryDTO>;
  delete(id: string): Promise<boolean>;
  getCategoryTree(): Promise<TCategoryWithChildren[]>;
  getCategoryDescendants(parentId: string): Promise<string[]>;
}
