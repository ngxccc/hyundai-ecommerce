import { fetchApi } from "../lib/api-client";
import type { TCategory } from "@nhatnang/database/schemas";

const isProductionBuild =
  process.env["NEXT_PHASE"] === "phase-production-build";

export const categoryService = {
  getCategories: async (): Promise<TCategory[]> => {
    if (isProductionBuild) {
      return [];
    }

    try {
      return await fetchApi<TCategory[]>(
        "/api/categories",
        {
          next: { revalidate: 3600 },
        },
      );
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  },
};
