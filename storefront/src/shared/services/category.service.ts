import { cacheLife } from "next/cache";
import { api } from "@/lib/api-client";
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
      const { data: res } = await api.GET("/categories");
      const categories = res?.data;
      if (!Array.isArray(categories)) {
        return [];
      }
      return categories.map((c) => mapCategoryToStorefront(c, locale));
    } catch (error) {
      console.error("Failed to fetch categories from backend:", error);
      return [];
    }
  },

  getCategoryTree: async (
    locale: Locale,
  ): Promise<StorefrontCategoryWithChildren[]> => {
    "use cache";
    cacheLife("hours");
    try {
      const { data: res } = await api.GET("/categories/tree");
      const tree = res?.data;
      if (!Array.isArray(tree)) {
        return [];
      }
      return tree.map((node) => mapCategoryTreeToStorefront(node, locale));
    } catch (error) {
      console.error("Failed to fetch category tree from backend:", error);
      return [];
    }
  },

  getCategoryDescendants: async (categoryId: string): Promise<string[]> => {
    "use cache";
    cacheLife("hours");
    try {
      const { data: res } = await api.GET("/categories/tree");
      const tree = res?.data;
      if (!Array.isArray(tree)) {
        return [categoryId];
      }
      const findDescendants = (
        nodes: typeof tree,
        targetId: string,
      ): string[] => {
        for (const node of nodes) {
          if (node.id === targetId) {
            const collect = (n: typeof node): string[] => [
              n.id,
              ...(n.children ?? []).flatMap(collect),
            ];
            return collect(node);
          }
          if (node.children && node.children.length > 0) {
            const found = findDescendants(node.children, targetId);
            if (found.length > 0) return found;
          }
        }
        return [];
      };
      const result = findDescendants(tree, categoryId);
      return result.length > 0 ? result : [categoryId];
    } catch (error) {
      console.error("Failed to fetch category descendants:", error);
      return [categoryId];
    }
  },
};
