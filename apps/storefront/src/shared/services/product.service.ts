import { fetchApi } from "../lib/api-client";
import {
  BUILD_TIME_PRODUCTS,
  getProductSlug,
  PRODUCTS_REVALIDATE_SECONDS,
} from "../constants/products";
import type { TProduct } from "@nhatnang/database/schemas";

const isProductionBuild =
  process.env["NEXT_PHASE"] === "phase-production-build";

const getBuildSafeProducts = async (): Promise<TProduct[]> => {
  if (isProductionBuild) {
    return BUILD_TIME_PRODUCTS;
  }

  try {
    return await fetchApi<TProduct[]>("/api/products", {
      next: { revalidate: PRODUCTS_REVALIDATE_SECONDS },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return BUILD_TIME_PRODUCTS;
  }
};

export const productService = {
  getProducts: async (): Promise<TProduct[]> => {
    return await getBuildSafeProducts();
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
