import { fetchApi } from "../lib/api-client";
import {
  BUILD_TIME_PRODUCTS,
  getProductSlug,
  PRODUCTS_REVALIDATE_SECONDS,
} from "../constants/products";
import type { TProduct } from "@nhatnang/database/schemas";
import type { TGetAllOptions } from "@nhatnang/database/services";

const isProductionBuild =
  process.env["NEXT_PHASE"] === "phase-production-build";

const getBuildSafeProducts = async (): Promise<TProduct[]> => {
  if (isProductionBuild) {
    return BUILD_TIME_PRODUCTS;
  }

  try {
    const response = await fetchApi<TGetProductsResponse>("/api/products", {
      next: { revalidate: PRODUCTS_REVALIDATE_SECONDS },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return BUILD_TIME_PRODUCTS;
  }
};

export interface TGetProductsResponse {
  data: TProduct[];
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
}

export const productService = {
  getProducts: async (
    options?: TGetAllOptions,
  ): Promise<TGetProductsResponse> => {
    if (isProductionBuild) {
      return { data: BUILD_TIME_PRODUCTS, hasMore: false };
    }

    try {
      const params = new URLSearchParams();
      if (options) {
        Object.entries(options).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            if (Array.isArray(val)) {
              val.forEach((v) => params.append(key, String(v)));
            } else {
              params.set(key, String(val));
            }
          }
        });
      }

      const res = await fetchApi<TGetProductsResponse>(
        `/api/products?${params.toString()}`,
        {
          next: { revalidate: PRODUCTS_REVALIDATE_SECONDS },
        },
      );
      return res;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return { data: BUILD_TIME_PRODUCTS, hasMore: false };
    }
  },

  getStaticProductSlugs: async (): Promise<string[]> => {
    const products = await getBuildSafeProducts();
    return products.map(getProductSlug);
  },

  getProductBySlug: async (slug: string): Promise<TProduct | null> => {
    const products = await getBuildSafeProducts();
    return products.find((product) => getProductSlug(product) === slug) ?? null;
  },
};
