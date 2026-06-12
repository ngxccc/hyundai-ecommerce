import { cacheLife } from "next/cache";
import { categoryService as dbCategoryService } from "@nhatnang/database/services";
import type { TCategory } from "@nhatnang/database/schemas";
import type { TCategoryWithChildren } from "@nhatnang/database/services";

export const categoryService = {
  getCategories: async (): Promise<TCategory[]> => {
    "use cache";
    cacheLife("hours");
    try {
      return await dbCategoryService.getAll();
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  },

  getCategoryTree: async (): Promise<TCategoryWithChildren[]> => {
    "use cache";
    cacheLife("hours");
    try {
      return await dbCategoryService.getCategoryTree();
    } catch (error) {
      console.error("Failed to fetch category tree:", error);
      return [];
    }
  },

  getCategoryDescendants: async (categoryId: string): Promise<string[]> => {
    "use cache";
    cacheLife("hours");
    try {
      return await dbCategoryService.getCategoryDescendants(categoryId);
    } catch (error) {
      console.error("Failed to fetch category descendants:", error);
      return [categoryId];
    }
  },
};
