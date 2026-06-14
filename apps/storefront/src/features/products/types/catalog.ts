import type { GetAllOptions } from "@nhatnang/database/services";

/**
 * CatalogSearchParams
 * URL search parameters for product catalog pages.
 * Derived from TGetAllOptions with storefront-specific string representations
 * for fields that require type conversion (voltage, power bounds) or slug-based
 * filtering (brand, category).
 */
export type CatalogSearchParams = Omit<
  GetAllOptions,
  | "categoryId"
  | "categoryIds"
  | "brandId"
  | "brandIds"
  | "status"
  | "isQuoteOnly"
  | "search"
  | "voltage"
  | "minPower"
  | "maxPower"
> & {
  category?: string;
  brand?: string;
  q?: string;
  voltage?: string;
  minPower?: string;
  maxPower?: string;
};

/**
 * CatalogPageProps
 * Generic props interface for catalog Server Components.
 * TParams allows pages to specify their route parameter shape
 * (e.g., { locale: string } vs { locale: string; slug: string }).
 */
export interface CatalogPageProps<TParams extends Record<string, string>> {
  params: Promise<TParams>;
  searchParams: Promise<CatalogSearchParams>;
}
