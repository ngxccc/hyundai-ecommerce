import { cacheLife } from "next/cache";
import { productService as dbProductService } from "@nhatnang/database/services";
import type { TProduct } from "@nhatnang/database/schemas";
import type { TGetAllOptions, IProductFilterMetadata } from "@nhatnang/database/services";

export interface TGetProductsResponse {
  data: TProduct[];
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  hasMore: boolean;
}

export const productService = {
  getProducts: async (
    limit?: number,
    options?: TGetAllOptions,
  ): Promise<TGetProductsResponse> => {
    "use cache";
    cacheLife("hours");
    try {
      return await dbProductService.getAll(limit, options);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return {
        data: [],
        hasMore: false,
        nextCursor: undefined,
        prevCursor: undefined,
      };
    }
  },

  getStaticProductSlugs: async (): Promise<string[]> => {
    "use cache";
    cacheLife("days");
    try {
      return await dbProductService.getAllActiveSlugs();
    } catch (error) {
      console.error("Failed to fetch product slugs:", error);
      return [];
    }
  },

  getProductBySlug: async (slug: string): Promise<TProduct | null> => {
    "use cache";
    cacheLife("hours");
    try {
      return await dbProductService.getActiveProductBySlug(slug);
    } catch (error) {
      console.error("Failed to fetch product by slug:", error);
      return null;
    }
  },
  getFiltersMetadata: async (): Promise<IProductFilterMetadata[]> => {
    "use cache";
    cacheLife("hours");
    try {
      return await dbProductService.getFiltersMetadata();
    } catch (error) {
      console.error("Failed to fetch product filters metadata:", error);
      return [];
    }
  },
};
