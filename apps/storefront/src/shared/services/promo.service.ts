import { fetchApi } from "../lib/api-client";
import type { PromoCampaign } from "../types/common";

export const promoService = {
  getPromos: async (): Promise<PromoCampaign[]> => {
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
