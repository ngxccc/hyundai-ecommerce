import type { TCategory } from "../schemas";
import type { TCreateCategoryInput, TUpdateCategoryInput } from "../validators";


export interface ICategoryService {
  /**
   * Get all categories from the database
   */
  getAll(): Promise<TCategory[]>;

  getById(id: string): Promise<TCategory | undefined>;

  create(input: TCreateCategoryInput): Promise<TCategory>;

  update(input: TUpdateCategoryInput): Promise<TCategory>;

  delete(id: string): Promise<boolean>;
}
