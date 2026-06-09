import { fetchApi } from "../lib/api-client";
import type { TCategory } from "@nhatnang/database/schemas";

const isProductionBuild =
  process.env["NEXT_PHASE"] === "phase-production-build";

export const categoryService = {
  getCategories: async (options?: { tree?: boolean }): Promise<TCategory[]> => {
    if (isProductionBuild) {
      return [];
    }

    try {
      const params = new URLSearchParams();
      if (options?.tree) {
        params.set("tree", "true");
      }

      return await fetchApi<TCategory[]>(
        `/api/categories?${params.toString()}`,
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
