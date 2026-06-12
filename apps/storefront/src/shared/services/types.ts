import type { JSONContent } from "@tiptap/core";
import type {
  TBrandDTO,
  TCategoryDTO,
  TProductDTO,
} from "@nhatnang/database/dtos";
import type { TProductSpecs } from "@nhatnang/database/validators";
import type { TCategoryWithChildren } from "@nhatnang/database/services";
import { mapCategoryToDTO } from "@nhatnang/database/dtos";
import type { Locale } from "next-intl";

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
  specs: TProductSpecs | null;
  totalStockCache: number;
  isQuoteOnly: boolean;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  image: string | null;
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
  isActive: boolean;
}

export function mapProductToStorefront(
  dto: TProductDTO,
  locale: Locale,
): StorefrontProduct {
  return {
    id: dto.id,
    name: locale === "en" && dto.nameEn ? dto.nameEn : dto.nameVi,
    slug: dto.slug,
    price: dto.price,
    description:
      locale === "en" && dto.descriptionEn
        ? dto.descriptionEn
        : dto.descriptionVi,
    shortDescription:
      locale === "en" && dto.shortDescriptionEn
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
  dto: TCategoryDTO,
  locale: Locale,
): StorefrontCategory {
  return {
    id: dto.id,
    name: locale === "en" && dto.nameEn ? dto.nameEn : dto.nameVi,
    slug: dto.slug,
    parentId: dto.parentId,
    description:
      locale === "en" && dto.descriptionEn
        ? dto.descriptionEn
        : dto.descriptionVi,
    image: dto.image,
    isActive: dto.isActive,
  };
}
export function mapCategoryTreeToStorefront(
  node: TCategoryWithChildren,
  locale: "vi" | "en",
): StorefrontCategoryWithChildren {
  const dto = mapCategoryToDTO(node);
  return {
    ...mapCategoryToStorefront(dto, locale),
    children:
      node.children?.map((child) =>
        mapCategoryTreeToStorefront(child, locale),
      ) ?? [],
  };
}

export function mapBrandToStorefront(
  dto: TBrandDTO,
  locale: Locale,
): StorefrontBrand {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    logo: dto.logo,
    description:
      locale === "en" && dto.descriptionEn
        ? dto.descriptionEn
        : dto.descriptionVi,
    isActive: dto.isActive,
  };
}
