import { cacheLife } from "next/cache";
import { brandService as dbBrandService } from "@nhatnang/database/services";
import type { TBrand } from "@nhatnang/database/schemas";

export const brandService = {
  getBrands: async (): Promise<TBrand[]> => {
    "use cache";
    cacheLife("hours");
    try {
      return await dbBrandService.getAll();
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      return [];
    }
  },
};
