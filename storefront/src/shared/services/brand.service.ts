import { cacheLife } from "next/cache";
import { api } from "@/lib/api-client";
import { type StorefrontBrand, mapBrandToStorefront } from "./types";
import type { Locale } from "next-intl";

export const brandService = {
  getBrands: async (locale: Locale): Promise<StorefrontBrand[]> => {
    "use cache";
    cacheLife("hours");
    try {
      const { data: res } = await api.GET("/api/v1/brands");
      const brands = res?.data;
      if (!Array.isArray(brands)) {
        return [];
      }
      return brands.map((b) => mapBrandToStorefront(b, locale));
    } catch (error) {
      console.error("Failed to fetch brands from backend:", error);
      return [];
    }
  },
};
