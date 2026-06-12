import { cacheLife } from "next/cache";
import { productService as dbProductService } from "@nhatnang/database/services";
import { mapProductToDTO } from "@nhatnang/database/dtos";
import type { TGetAllOptions } from "@nhatnang/database/services";
import {
  type StorefrontProduct,
  type StorefrontFilterMetadata,
  mapProductToStorefront,
} from "./types";
import type { Locale } from "next-intl";

export interface TGetProductsResponse {
  data: StorefrontProduct[];
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  hasMore: boolean;
}

export const productService = {
  getProducts: async (
    locale: Locale,
    limit?: number,
    options?: TGetAllOptions,
  ): Promise<TGetProductsResponse> => {
    "use cache";
    cacheLife("hours");
    try {
      const res = await dbProductService.getAll(limit, options);
      return {
        data: res.data.map((p) =>
          mapProductToStorefront(mapProductToDTO(p), locale),
        ),
        hasMore: res.hasMore,
        nextCursor: res.nextCursor,
        prevCursor: res.prevCursor,
      };
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

  getProductBySlug: async (
    locale: Locale,
    slug: string,
  ): Promise<StorefrontProduct | null> => {
    "use cache";
    cacheLife("hours");
    try {
      const product = await dbProductService.getActiveProductBySlug(slug);
      if (!product) return null;
      return mapProductToStorefront(mapProductToDTO(product), locale);
    } catch (error) {
      console.error("Failed to fetch product by slug:", error);
      return null;
    }
  },
  getFiltersMetadata: async (
    locale: Locale,
  ): Promise<StorefrontFilterMetadata[]> => {
    "use cache";
    cacheLife("hours");
    try {
      const metadata = await dbProductService.getFiltersMetadata();
      return metadata.map((m) => ({
        id: m.id,
        name: locale === "en" && m.nameEn ? m.nameEn : m.nameVi,
        categoryId: m.categoryId,
        brandId: m.brandId,
        specs: m.specs as Record<string, unknown> | null,
      }));
    } catch (error) {
      console.error("Failed to fetch product filters metadata:", error);
      return [];
    }
  },
};
