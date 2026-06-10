"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@nhatnang/ui/components/ui/button";
import { ProductFilters } from "./product-filters";
import type { TCategoryWithChildren } from "@nhatnang/database/services";
import type { TBrand } from "@nhatnang/database/schemas";
import { useTranslations } from "next-intl";
interface DesktopProductFiltersProps {
  categories: TCategoryWithChildren[];
  brands: TBrand[];
  selectedCategorySlug?: string | undefined;
}

export function DesktopProductFilters({
  categories,
  brands,
  selectedCategorySlug,
}: DesktopProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Catalog.sidebar");
  const [pendingParams, setPendingParams] = useState<URLSearchParams | null>(
    null,
  );

  const handlePendingChange = (params: URLSearchParams) => {
    setPendingParams(params);
  };

  const handleApply = () => {
    if (pendingParams) {
      const query = pendingParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
    setPendingParams(null);
  };

  const handleClear = () => {
    setPendingParams(null);
    router.push(pathname, { scroll: false });
  };

  const activeFilterCount = pendingParams
    ? Array.from(pendingParams.keys()).filter(
        (k) => !["after", "before"].includes(k),
      ).length
    : 0;

  return (
    <div className="space-y-4">
      <ProductFilters
        categories={categories}
        brands={brands}
        selectedCategorySlug={selectedCategorySlug ?? ""}
        mode="sheet"
        onPendingFiltersChange={handlePendingChange}
        pendingSearchParams={pendingParams ?? undefined}
      />
      <div className="flex gap-2 border-t pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleClear}
          disabled={!pendingParams}
        >
          {t("clear_all")}
        </Button>
        <Button
          className="flex-1"
          onClick={handleApply}
          disabled={!pendingParams || activeFilterCount === 0}
        >
          {t("apply", { count: String(activeFilterCount) })}
        </Button>
      </div>
    </div>
  );
}
