import { cacheLife } from "next/cache";
import { catalogApi } from "../api/catalog.api";
import type { ProductQueryParams } from "@/types/api";
import {
  type StorefrontProduct,
  type StorefrontCatalogMetadata,
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
export interface CatalogQueryOptions extends Omit<
  ProductQueryParams,
  "voltage" | "phase" | "fuelType" | "canopyType" | "sort"
> {
  voltage?: string | number | null | undefined;
  phase?: ProductQueryParams["phase"] | (string & {}) | null | undefined;
  fuelType?: ProductQueryParams["fuelType"] | (string & {}) | null | undefined;
  canopyType?:
    ProductQueryParams["canopyType"] | (string & {}) | null | undefined;
  sort?: ProductQueryParams["sort"] | (string & {}) | null | undefined;
  brandIds?: string[] | undefined;
  categoryIds?: string[] | undefined;
  after?: string | undefined;
  before?: string | undefined;
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
      const {
        brandIds,
        categoryIds,
        after: _after,
        before: _before,
        voltage,
        phase,
        fuelType,
        canopyType,
        sort,
        ...rest
      } = options ?? {};

      const queryParams: ProductQueryParams = {
        locale,
        limit,
        page: rest.page ?? 1,
        ...rest,
        brandId: rest.brandId ?? brandIds?.[0],
        categoryId: rest.categoryId ?? categoryIds?.[0],
        voltage:
          voltage != null && voltage !== "" ? String(voltage) : undefined,
        phase:
          phase && phase !== ""
            ? (phase as ProductQueryParams["phase"])
            : undefined,
        fuelType:
          fuelType && fuelType !== ""
            ? (fuelType as ProductQueryParams["fuelType"])
            : undefined,
        canopyType:
          canopyType && canopyType !== ""
            ? (canopyType as ProductQueryParams["canopyType"])
            : undefined,
        sort:
          sort && sort !== ""
            ? (sort as ProductQueryParams["sort"])
            : undefined,
      };

      const { data: res } = await catalogApi.products.list(queryParams);

      const items = res?.data ?? [];
      const meta = res?.meta;

      return {
        data: items.map((p) => mapProductToStorefront(p)),
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
      const { data: res } = await catalogApi.products.getById(slug, {
        locale,
      });
      const product = res?.data;
      if (!product) return null;
      return mapProductToStorefront(product);
    } catch (error) {
      console.error("Failed to fetch product by slug:", error);
      return null;
    }
  },

  getFiltersMetadata: async (
    locale: Locale,
  ): Promise<StorefrontCatalogMetadata | null> => {
    "use cache";
    cacheLife("hours");
    try {
      const { data: res } = await catalogApi.products.getMetadata({
        locale,
      });
      return res?.data ?? null;
    } catch (error) {
      console.error("Failed to fetch product filters metadata:", error);
      return null;
    }
  },
};
