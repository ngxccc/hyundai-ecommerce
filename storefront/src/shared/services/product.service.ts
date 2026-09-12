import { cacheLife } from "next/cache";
import { catalogApi } from "../api/catalog.api";
import type {
  ProductQueryParams,
  ProductPhase,
  ProductFuelType,
  ProductCanopyType,
  ProductSort,
} from "@/types/api";
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
export type CatalogQueryOptions = Omit<
  ProductQueryParams,
  "phase" | "fuelType" | "canopyType" | "sort" | "voltage"
> & {
  phase?: ProductPhase | (string & {}) | undefined;
  fuelType?: ProductFuelType | (string & {}) | undefined;
  canopyType?: ProductCanopyType | (string & {}) | undefined;
  sort?: ProductSort | (string & {}) | undefined;
  voltage?: string | number | undefined;
  brandIds?: string[] | undefined;
  categoryIds?: string[] | undefined;
  after?: string | undefined;
  before?: string | undefined;
};

export const productService = {
  getProducts: async (
    locale: Locale,
    limit = 20,
    options?: CatalogQueryOptions,
  ): Promise<GetProductsResponse> => {
    "use cache";
    cacheLife("hours");
    try {
      const { data: res } = await catalogApi.products.list({
        limit,
        page: options?.page ?? 1,
        search: options?.search,
        brandId: options?.brandId ?? options?.brandIds?.[0],
        categoryId: options?.categoryId ?? options?.categoryIds?.[0],
        priceMin: options?.priceMin,
        priceMax: options?.priceMax,
        minPower: options?.minPower,
        maxPower: options?.maxPower,
        phase: options?.phase as ProductPhase,
        fuelType: options?.fuelType as ProductFuelType,
        canopyType: options?.canopyType as ProductCanopyType,
        sort: options?.sort as ProductSort,
        voltage: options?.voltage != null ? String(options.voltage) : undefined,
        engineBrand: options?.engineBrand,
        alternatorBrand: options?.alternatorBrand,
        status: options?.status,
        isQuoteOnly: options?.isQuoteOnly,
      });

      const items = res?.data ?? [];
      const meta = res?.meta;

      return {
        data: items.map((p) => mapProductToStorefront(p, locale)),
        total: meta?.total ?? 0,
        page: meta?.page ?? 1,
        totalPages: meta?.totalPages ?? 0,
        hasMore: meta?.hasNextPage ?? false,
        nextCursor: meta?.hasNextPage ? String(meta.page + 1) : undefined,
        prevCursor: meta?.hasPrevPage ? String(meta.page - 1) : undefined,
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
      const allSlugs: string[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 10) {
        const { data: res } = await catalogApi.products.list({
          page,
          limit: 100,
        });
        const items = res?.data ?? [];
        allSlugs.push(...items.map((p) => p.slug));

        const totalPages = res?.meta ? res.meta.totalPages : 1;
        if (page >= totalPages || items.length === 0) {
          hasMore = false;
        } else {
          page++;
        }
      }

      return allSlugs;
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
      const { data: res } = await catalogApi.products.getById(slug);
      const product = res?.data;
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
      const { data: res } = await catalogApi.products.getMetadata();
      const metadata = res?.data;
      if (!metadata) return [];
      const isEn = locale === "en";
      return metadata.categories.map((c) => ({
        id: c.id,
        name: isEn && c.nameEn ? c.nameEn : c.nameVi,
        categoryId: c.id,
        brandId: null,
        specs: null,
      }));
    } catch (error) {
      console.error("Failed to fetch product filters metadata:", error);
      return [];
    }
  },
};
