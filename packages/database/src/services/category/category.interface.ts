import type { CategoryDTO } from "../../schemas";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../validators";

export type CategoryWithChildren = CategoryDTO & {
  children?: CategoryWithChildren[];
};

export interface CategoryService {
  getAll(): Promise<CategoryDTO[]>;
  getById(id: string): Promise<CategoryDTO>;
  create(input: CreateCategoryInput): Promise<CategoryDTO>;
  update(input: UpdateCategoryInput): Promise<CategoryDTO>;
  delete(id: string): Promise<boolean>;
  getCategoryTree(): Promise<CategoryWithChildren[]>;
  getCategoryDescendants(parentId: string): Promise<string[]>;
}
