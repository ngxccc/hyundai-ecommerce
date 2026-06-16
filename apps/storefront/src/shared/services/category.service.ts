import { cacheLife } from "next/cache";
import { categoryService as dbCategoryService } from "@nhatnang/database/services";
import {
  type StorefrontCategory,
  type StorefrontCategoryWithChildren,
  mapCategoryToStorefront,
  mapCategoryTreeToStorefront,
} from "./types";
import type { Locale } from "next-intl";

export const categoryService = {
  getCategories: async (locale: Locale): Promise<StorefrontCategory[]> => {
    "use cache";
    cacheLife("hours");
    try {
      const dbCategories = await dbCategoryService.getAll();
      return dbCategories.map((c) => mapCategoryToStorefront(c, locale));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  },

  getCategoryTree: async (
    locale: Locale,
  ): Promise<StorefrontCategoryWithChildren[]> => {
    "use cache";
    cacheLife("hours");
    try {
      const dbTree = await dbCategoryService.getCategoryTree();
      return dbTree.map((node) => mapCategoryTreeToStorefront(node, locale));
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
