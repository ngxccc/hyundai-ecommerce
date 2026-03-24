import { fetchApi } from "@/shared/lib/api-client";
import type { NewsArticle } from "@/shared/types/common";

export const newsService = {
  getLatest: async (): Promise<NewsArticle[]> => {
    try {
      return await fetchApi<NewsArticle[]>("/api/news", {
        next: { revalidate: 3600 }, // Cache 1 tiếng
      });
    } catch (error) {
      console.error("Failed to fetch news:", error);
      return []; // Graceful degradation cho riêng news
    }
  },
};
