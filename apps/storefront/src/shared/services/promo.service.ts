import { fetchApi } from "../lib/api-client";
import type { PromoCampaign } from "@nhatnang/types";

const isProductionBuild =
  process.env["NEXT_PHASE"] === "phase-production-build";

export const promoService = {
  getPromos: async (): Promise<PromoCampaign[]> => {
    if (isProductionBuild) {
      return [];
    }

    try {
      return await fetchApi<PromoCampaign[]>("/api/promotions", {
        next: { revalidate: 3600 }, // Cache 1 tiếng
      });
    } catch (error) {
      console.error("Failed to fetch promos:", error);
      return [];
    }
  },
};
