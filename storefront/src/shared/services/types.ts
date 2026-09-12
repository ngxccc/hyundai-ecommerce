export type JSONContent = Record<string, unknown>;
import type { ApiProduct, ApiCategory, ApiBrand } from "@/types/api";
import type { ProductSpecSheet } from "@/types/product-spec";

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  description: JSONContent | null;
  shortDescription: string | null;
  images: string[];
  brandId: string | null;
  categoryId: string | null;
  specs: Record<string, unknown> | null;
  specSheet: ProductSpecSheet | null;
  totalStockCache: number;
  isQuoteOnly: boolean;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface StorefrontCategoryWithChildren extends StorefrontCategory {
  children: StorefrontCategoryWithChildren[];
}

export interface StorefrontFilterMetadata {
  id: string;
  name: string;
  categoryId: string | null;
  brandId: string | null;
  specs: Record<string, unknown> | null;
}

export interface StorefrontBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  sortOrder: number;
  isActive: boolean;
}

export function mapProductToStorefront(
  dto: ApiProduct,
): StorefrontProduct {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    price: dto.price,
    description: (dto.description ?? null),
    shortDescription: dto.shortDescription ?? null,
    images: dto.images,
    brandId: dto.brandId ?? null,
    categoryId: dto.categoryId ?? null,
    specs: dto.specs,
    specSheet: Array.isArray(dto.specSheet) ? dto.specSheet : null,
    totalStockCache: dto.totalStockCache,
    isQuoteOnly: dto.isQuoteOnly,
  };
}

export function mapCategoryToStorefront(
  dto: ApiCategory,
): StorefrontCategory {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? null,
    icon: null,
    image: dto.image ?? null,
    parentId: dto.parentId ?? null,
    sortOrder: 0,
    isActive: dto.isActive,
  };
}

export function mapCategoryTreeToStorefront(
  node: ApiCategory,
): StorefrontCategoryWithChildren {
  return {
    ...mapCategoryToStorefront(node),
    children: (node.children ?? []).map((c) =>
      mapCategoryTreeToStorefront(c),
    ),
  };
}

export function mapBrandToStorefront(
  dto: ApiBrand,
): StorefrontBrand {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    logo: dto.logo ?? null,
    description: dto.description ?? null,
    website: null,
    sortOrder: 0,
    isActive: dto.isActive,
  };
}
