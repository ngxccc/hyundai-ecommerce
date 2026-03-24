import { fetchApi } from "../lib/api-client";
import type { Category } from "../types/common";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    return await fetchApi<Category[]>("/api/categories", {
      next: { revalidate: 3600 },
    });
  },
};
