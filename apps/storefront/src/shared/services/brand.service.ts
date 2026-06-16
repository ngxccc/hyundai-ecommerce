import { cacheLife } from "next/cache";
import { brandService as dbBrandService } from "@nhatnang/database/services";
import { type StorefrontBrand, mapBrandToStorefront } from "./types";
import type { Locale } from "next-intl";

export const brandService = {
  getBrands: async (locale: Locale): Promise<StorefrontBrand[]> => {
    "use cache";
    cacheLife("hours");
    try {
      const dbBrands = await dbBrandService.getAll();
      return dbBrands.map((b) => mapBrandToStorefront(b, locale));
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      return [];
    }
  },
};
