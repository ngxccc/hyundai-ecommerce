export type JSONContent = Record<string, unknown>;
import type {
  ApiProduct,
  ApiCategory,
  ApiBrand,
  StorefrontProduct,
  StorefrontCategory,
  StorefrontBrand,
} from "@/types/api";

export type { StorefrontProduct, StorefrontCategory, StorefrontBrand };

export interface StorefrontCategoryWithChildren extends StorefrontCategory {
  children: StorefrontCategoryWithChildren[];
}

export interface StorefrontRangeFacet {
  min: number;
  max: number;
}

export interface StorefrontCatalogMetadata {
  brands: { id: string; name: string; count: number }[];
  categories: { id: string; name: string; count: number }[];
  powerRange: StorefrontRangeFacet;
  priceRange: StorefrontRangeFacet;
  fuelTypes: { value: string; count: number }[];
  phases: { value: string; count: number }[];
  canopyTypes: { value: string; count: number }[];
}

export interface StorefrontFilterMetadata {
  id: string;
  name: string;
  categoryId: string | null;
  brandId: string | null;
  specs: Record<string, unknown> | null;
}

export function mapProductToStorefront(dto: ApiProduct): StorefrontProduct {
  return {
    ...dto,
    specSheet: dto.specSheet,
  };
}

export function mapCategoryToStorefront(dto: ApiCategory): StorefrontCategory {
  return dto;
}

export function mapCategoryTreeToStorefront(
  node: ApiCategory,
): StorefrontCategoryWithChildren {
  return {
    ...node,
    children: (node.children ?? []).map((c) => mapCategoryTreeToStorefront(c)),
  };
}

export function mapBrandToStorefront(dto: ApiBrand): StorefrontBrand {
  return dto;
}
