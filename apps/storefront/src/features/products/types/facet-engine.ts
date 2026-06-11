import type { IProductFilterMetadata } from "@nhatnang/database/services";

export interface IProductActiveFilters {
  categorySlug: string | null;
  brandSlugs: string[];
  fuelType: string | null;
  phase: string | null;
  minPower: number | null;
  maxPower: number | null;
  voltage: number | null;
  engineBrand: string | null;
  alternatorBrand: string | null;
  q: string | null;
}

export interface ComputeFacetsParams {
  products: IProductFilterMetadata[];
  brands: { id: string; slug: string }[];
  categories: { id: string; slug: string; parentId: string | null }[];
  activeFilters: IProductActiveFilters;
}

export interface FacetStatus {
  categories: Record<string, boolean>;
  brands: Record<string, boolean>;
  fuelTypes: Record<string, boolean>;
  phases: Record<string, boolean>;
}
