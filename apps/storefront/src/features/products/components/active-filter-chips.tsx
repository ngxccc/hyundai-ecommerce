"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { useTranslations } from "next-intl";

const FILTER_KEY_MAP: Record<string, string> = {
  q: "search",
  brand: "brands",
  minPower: "min_power",
  maxPower: "max_power",
  voltage: "voltage",
  engineBrand: "engine_brand",
  alternatorBrand: "alternator_brand",
  fuelType: "fuel_type",
  phase: "phase",
};

export function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Catalog.sidebar");
  const tProduct = useTranslations("ProductDetails");

  const activeFilters: { key: string; value: string; label: string }[] = [];

  const getLabel = (key: string, value: string): string => {
    const translationKey = FILTER_KEY_MAP[key] ?? key;
    const labelPrefix = t(translationKey as any);

    if (key === "fuelType") {
      return `${labelPrefix}: ${tProduct(`fuelTypes.${value}` as any)}`;
    }
    if (key === "phase") {
      return `${labelPrefix}: ${tProduct(`phases.${value}` as any)}`;
    }
    return `${labelPrefix}: ${value}`;
  };

  searchParams.forEach((value, key) => {
    if (["after", "before", "category"].includes(key)) return;

    if (key === "brand") {
      value.split(",").forEach((v) => {
        activeFilters.push({ key, value: v, label: getLabel(key, v) });
      });
    } else {
      activeFilters.push({ key, value, label: getLabel(key, value) });
    }
  });

  if (activeFilters.length === 0) return null;

  const removeFilter = (keyToRemove: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (keyToRemove === "brand" && valueToRemove) {
      const currentBrands =
        params.get("brand")?.split(",").filter(Boolean) ?? [];
      const newBrands = currentBrands.filter((b) => b !== valueToRemove);

      if (newBrands.length > 0) {
        params.set("brand", newBrands.join(","));
      } else {
        params.delete("brand");
      }
    } else {
      params.delete(keyToRemove);
    }

    params.delete("after");
    params.delete("before");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground mr-1 text-sm">
        {t("active_filters")}:
      </span>
      {activeFilters.map((filter, index) => (
        <Button
          key={`${filter.key}-${filter.value}-${index}`}
          variant="secondary"
          size="sm"
          className="h-7 rounded-full px-3 text-xs font-normal"
          onClick={() =>
            removeFilter(
              filter.key,
              filter.key === "brand" ? filter.value : undefined,
            )
          }
        >
          {filter.label}
          <X className="ml-1.5 h-3 w-3" />
        </Button>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-7 text-xs"
          onClick={() => router.push(pathname, { scroll: false })}
        >
          {t("clear_all")}
        </Button>
      )}
    </div>
  );
}
