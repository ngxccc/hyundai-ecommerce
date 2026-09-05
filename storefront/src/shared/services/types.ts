export type JSONContent = Record<string, unknown>;
import type { Locale } from "next-intl";
import type {
  ApiProduct,
  ApiCategory,
  ApiCategoryTree,
  ApiBrand,
} from "@/lib/api-client";

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
  locale: Locale,
): StorefrontProduct {
  const isEn = locale === "en";
  return {
    id: dto.id,
    name: isEn && dto.nameEn ? dto.nameEn : dto.nameVi,
    slug: dto.slug,
    price: dto.price,
    description: (isEn && dto.descriptionEn
      ? dto.descriptionEn
      : dto.descriptionVi) as JSONContent | null,
    shortDescription:
      isEn && dto.shortDescriptionEn
        ? dto.shortDescriptionEn
        : dto.shortDescriptionVi,
    images: dto.images,
    brandId: dto.brandId,
    categoryId: dto.categoryId,
    specs: dto.specs,
    totalStockCache: dto.totalStockCache,
    isQuoteOnly: dto.isQuoteOnly,
  };
}

export function mapCategoryToStorefront(
  dto: ApiCategory,
  locale: Locale,
): StorefrontCategory {
  const isEn = locale === "en";
  return {
    id: dto.id,
    name: isEn && dto.nameEn ? dto.nameEn : dto.nameVi,
    slug: dto.slug,
    description:
      isEn && dto.descriptionEn ? dto.descriptionEn : dto.descriptionVi,
    icon: dto.icon,
    image: dto.image,
    parentId: dto.parentId,
    sortOrder: dto.sortOrder,
    isActive: dto.isActive,
  };
}

export function mapCategoryTreeToStorefront(
  node: ApiCategoryTree,
  locale: Locale,
): StorefrontCategoryWithChildren {
  return {
    ...mapCategoryToStorefront(node, locale),
    children: node.children.map((c) => mapCategoryTreeToStorefront(c, locale)),
  };
}

export function mapBrandToStorefront(
  dto: ApiBrand,
  locale: Locale,
): StorefrontBrand {
  const isEn = locale === "en";
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    logo: dto.logo,
    description:
      isEn && dto.descriptionEn ? dto.descriptionEn : dto.descriptionVi,
    website: dto.website,
    sortOrder: dto.sortOrder,
    isActive: dto.isActive,
  };
}
