import { fetchApi } from "../lib/api-client";
import type { Category } from "../types/common";

const isProductionBuild =
  process.env["NEXT_PHASE"] === "phase-production-build";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    if (isProductionBuild) {
      return [];
    }

    try {
      return await fetchApi<Category[]>("/api/categories", {
        next: { revalidate: 3600 },
      });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  },
};
