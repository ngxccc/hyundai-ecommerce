import { cacheLife } from "next/cache";
import { categoryService as dbCategoryService } from "@nhatnang/database/services";
import type { TCategory } from "@nhatnang/database/schemas";

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
};
