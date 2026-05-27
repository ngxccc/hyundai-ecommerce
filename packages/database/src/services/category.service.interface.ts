import type { TCategory } from "../schemas";

export interface ICategoryService {
  /**
   * Get all categories from the database
   */
  getAll(): Promise<TCategory[]>;
}
