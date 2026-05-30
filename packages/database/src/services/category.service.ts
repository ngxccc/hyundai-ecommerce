import type { ICategoryService } from "./category.service.interface";
import { categories, type TCategory } from "../schemas";
import { type IDatabase } from "../client";
import { eq } from "drizzle-orm";
import type { TCreateCategoryInput, TUpdateCategoryInput } from "../validators";
import type { TActionResult } from "@nhatnang/types";
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

  async create(input: TCreateCategoryInput): Promise<TActionResult<TCategory>> {
    try {
      const [newCategory] = await this.db.insert(categories).values(input).returning();
      if (!newCategory) return { success: false, code: "INTERNAL_SERVER_ERROR", error: "Failed to create category" };
      return { success: true, data: newCategory };
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        return { success: false, code: "VALIDATION_ERROR", error: "validation.slugExists" };
      }
      return { success: false, code: "INTERNAL_SERVER_ERROR", error: error instanceof Error ? error.message : "Failed to create category" };
    }
  }

  async update({
    id,
    ...data
  }: TUpdateCategoryInput): Promise<TActionResult<TCategory>> {
    try {
      const [updatedCategory] = await this.db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();
      if (!updatedCategory)
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: "Category not found",
        };
      return { success: true, data: updatedCategory };
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: "validation.slugExists",
        };
      }
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        error:
          error instanceof Error ? error.message : "Failed to update category",
      };
    }
  }

  async delete(id: string): Promise<TActionResult<boolean>> {
    try {
      await this.db.delete(categories).where(eq(categories.id, id));
      return { success: true, data: true };
    } catch (error: unknown) {
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        error:
          error instanceof Error ? error.message : "Failed to delete category",
      };
    }
  }
}
