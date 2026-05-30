import type { TCategory } from "../schemas";
import type { TCreateCategoryInput, TUpdateCategoryInput } from "../validators";
import type { TActionResult } from "@nhatnang/types";

export interface ICategoryService {
  /**
   * Get all categories from the database
   */
  getAll(): Promise<TCategory[]>;

  getById(id: string): Promise<TCategory | undefined>;

  create(input: TCreateCategoryInput): Promise<TActionResult<TCategory>>;

  update(input: TUpdateCategoryInput): Promise<TActionResult<TCategory>>;

  delete(id: string): Promise<TActionResult<boolean>>;
}
