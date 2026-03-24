import { fetchApi } from "../lib/api-client";
import type { Product } from "../types/common";

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      return await fetchApi<Product[]>("/api/products", {
        next: { revalidate: 3600 }, // Cache 1 tiếng
      });
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return [];
    }
  },
};
