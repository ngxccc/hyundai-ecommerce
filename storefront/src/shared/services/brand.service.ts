import { cacheLife } from "next/cache";
import { catalogApi } from "../api/catalog.api";
import { type StorefrontBrand, mapBrandToStorefront } from "./types";
import type { Locale } from "next-intl";

export const brandService = {
  getBrands: async (locale: Locale): Promise<StorefrontBrand[]> => {
    "use cache";
    cacheLife("hours");
    try {
      const { data: res } = await catalogApi.brands.list({ locale });
      const brands = res?.data;
      if (!Array.isArray(brands)) {
        return [];
      }
      return brands.map((b) => mapBrandToStorefront(b));
    } catch (error) {
      console.error("Failed to fetch brands from backend:", error);
      return [];
    }
  },
};
