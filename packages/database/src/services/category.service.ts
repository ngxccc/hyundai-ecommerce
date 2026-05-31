import type { ICategoryService } from "./category.service.interface";
import { categories, type TCategory } from "../schemas";
import { type IDatabase } from "../client";
import { eq } from "drizzle-orm";
import type { TCreateCategoryInput, TUpdateCategoryInput } from "../validators";

import { isUniqueConstraintError } from "../utils";

export class CategoryService implements ICategoryService {
  constructor(private readonly db: IDatabase) {}

  async getAll(): Promise<TCategory[]> {
    return this.db.query.categories.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getById(id: string): Promise<TCategory | undefined> {
    const [category] = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return category;
  }

  async create(input: TCreateCategoryInput): Promise<TCategory> {
    try {
      const [newCategory] = await this.db.insert(categories).values(input).returning();
      if (newCategory) return newCategory;
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        throw new Error("errors.validation.slugExists", { cause: error });
      }
      throw new Error("errors.createCategoryFailed", { cause: error });
    }

    throw new Error("errors.createCategoryFailed");
  }

  async update({
    id,
    ...data
  }: TUpdateCategoryInput): Promise<TCategory> {
    try {
      const [updatedCategory] = await this.db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();
      if (updatedCategory) return updatedCategory;
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        throw new Error("errors.validation.slugExists", { cause: error });
      }
      throw new Error("errors.updateCategoryFailed", { cause: error });
    }

    throw new Error("errors.categoryNotFound");
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error: unknown) {
      throw new Error("errors.deleteCategoryFailed", { cause: error });
    }
  }
}
