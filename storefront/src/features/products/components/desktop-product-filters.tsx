"use client";

import { ProductFilters } from "./product-filters";
import type {
  StorefrontCategoryWithChildren,
  StorefrontBrand,
} from "@/shared/services";

interface DesktopProductFiltersProps {
  categories: StorefrontCategoryWithChildren[];
  brands: StorefrontBrand[];
  selectedCategorySlug?: string | undefined;
  searchParams: Record<string, string | string[] | undefined>;
}

export function DesktopProductFilters({
  categories,
  brands,
  selectedCategorySlug,
  searchParams,
}: DesktopProductFiltersProps) {
  return (
    <div className="space-y-4">
      <ProductFilters
        categories={categories}
        brands={brands}
        selectedCategorySlug={selectedCategorySlug ?? ""}
        mode="live"
        searchParams={searchParams}
      />
    </div>
  );
}
