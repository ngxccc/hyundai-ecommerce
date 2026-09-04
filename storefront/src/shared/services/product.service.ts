import { cacheLife } from "next/cache";
import { apiClient } from "@/lib/api-client";
import {
  type StorefrontProduct,
  type StorefrontFilterMetadata,
  mapProductToStorefront,
} from "./types";
import type { Locale } from "next-intl";

export interface GetProductsResponse {
  data: StorefrontProduct[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor?: string | undefined;
  prevCursor?: string | undefined;
}

export interface CatalogQueryOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  brandId?: string | undefined;
  brandIds?: string[] | undefined;
  categoryId?: string | undefined;
  categoryIds?: string[] | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  phase?: string | undefined;
  fuelType?: string | undefined;
  canopyType?: string | undefined;
  voltage?: number | undefined;
  minPower?: number | undefined;
  maxPower?: number | undefined;
  engineBrand?: string | undefined;
  alternatorBrand?: string | undefined;
  isQuoteOnly?: boolean | undefined;
  status?: string | undefined;
  after?: string | undefined;
  before?: string | undefined;
  sort?: string | undefined;
}

export const productService = {
  getProducts: async (
    locale: Locale,
    limit = 20,
    options?: CatalogQueryOptions,
  ): Promise<GetProductsResponse> => {
    "use cache";
    cacheLife("hours");
    try {
      const res = await apiClient.catalog.getProducts({
        limit,
        page: options?.page ?? 1,
        search: options?.search,
        brandId: options?.brandId,
        categoryId: options?.categoryId,
        priceMin: options?.priceMin,
        priceMax: options?.priceMax,
        phase: options?.phase,
        fuelType: options?.fuelType,
        canopyType: options?.canopyType,
        sort: options?.sort,
      });

      return {
        data: res.items.map((p) => mapProductToStorefront(p, locale)),
        total: res.pagination.total,
        page: res.pagination.page,
        totalPages: res.pagination.totalPages,
        hasMore: res.pagination.hasNext,
        nextCursor: res.pagination.hasNext
          ? String(res.pagination.page + 1)
          : undefined,
        prevCursor: res.pagination.hasPrev
          ? String(res.pagination.page - 1)
          : undefined,
      };
    } catch (error) {
      console.error("Failed to fetch products from backend:", error);
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
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
      const res = await apiClient.catalog.getProducts({ limit: 100 });
      return res.items.map((p) => p.slug);
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
      const product = await apiClient.catalog.getProductByIdOrSlug(slug);
      if (!product) return null;
      return mapProductToStorefront(product, locale);
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
      const metadata = await apiClient.catalog.getFiltersMetadata();
      return metadata.filters.map((m) => ({
        id: m.id,
        name: locale === "en" && m.nameEn ? m.nameEn : m.nameVi,
        categoryId: m.categoryId,
        brandId: m.brandId,
        specs: m.specs,
      }));
    } catch (error) {
      console.error("Failed to fetch product filters metadata:", error);
      return [];
    }
  },
};
