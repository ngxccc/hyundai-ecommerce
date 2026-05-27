import type { ICategoryService } from "./category.service.interface";
import { categories, type TCategory } from "../schemas";
import type { IDatabase } from "../client";

export class CategoryService implements ICategoryService {
  constructor(private readonly db: IDatabase) {}

  async getAll(): Promise<TCategory[]> {
    return this.db.select().from(categories);
  }
}
