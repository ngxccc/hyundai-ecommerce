export const FUEL_TYPES = ["diesel", "gasoline", "gas"] as const;
export const PHASES = ["1phase", "3phase"] as const;
export type FuelType = (typeof FUEL_TYPES)[number];
export type Phase = (typeof PHASES)[number];

/**
 * CatalogSearchParams
 * URL search parameters for product catalog pages.
 * Supports string representations for fields that require type conversion (voltage, power bounds)
 * or slug-based filtering (brand, category).
 */
export interface CatalogSearchParams {
  category?: string;
  brand?: string;
  q?: string;
  voltage?: string;
  minPower?: string;
  maxPower?: string;
  phase?: string;
  fuelType?: string;
  canopyType?: string;
  engineBrand?: string;
  alternatorBrand?: string;
  sort?: string;
  cursor?: string;
  direction?: "next" | "prev";
  after?: string;
  before?: string;
  page?: string;
  limit?: string;
  [key: string]: string | string[] | undefined;
}

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
