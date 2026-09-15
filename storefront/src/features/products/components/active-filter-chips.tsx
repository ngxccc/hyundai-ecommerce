"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const activeFilters: { key: string; value: string; label: string }[] = [];

  const getLabel = (key: string, value: string): string => {
    if (key === "q") {
      return `Tìm: "${value}"`;
    }
    if (key === "minPower") {
      return `Công suất: ≥ ${value} kW`;
    }
    if (key === "maxPower") {
      return `Công suất: ≤ ${value} kW`;
    }
    if (key === "voltage") {
      return `Điện áp: ${value}V`;
    }
    if (key === "fuelType") {
      const label =
        value === "gasoline"
          ? "Xăng"
          : value === "diesel"
            ? "Diesel"
            : value === "gas"
              ? "Gas"
              : value;
      return `Nhiên liệu: ${label}`;
    }
    if (key === "phase") {
      const label =
        value === "1phase" ? "1 Pha" : value === "3phase" ? "3 Pha" : value;
      return `Pha điện: ${label}`;
    }
    if (key === "engineBrand") {
      return `Động cơ: ${value}`;
    }
    if (key === "alternatorBrand") {
      return `Đầu phát: ${value}`;
    }

    const translationKey = FILTER_KEY_MAP[key] ?? key;
    const labelPrefix = t(translationKey as never);
    return `${labelPrefix}: ${value}`;
  };

  searchParams.forEach((value, key) => {
    if (!(key in FILTER_KEY_MAP)) return;

    if (key === "brand") {
      value.split(",").forEach((v) => {
        activeFilters.push({ key, value: v, label: `Hãng: ${v}` });
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
    params.delete("page");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-muted-foreground mr-1 text-xs font-semibold tracking-wider uppercase select-none">
        {t("active_filters")}:
      </span>
      {activeFilters.map((filter, index) => (
        <button
          key={`${filter.key}-${filter.value}-${index}`}
          onClick={() => {
            removeFilter(
              filter.key,
              filter.key === "brand" ? filter.value : undefined,
            );
          }}
          className="bg-muted/60 text-foreground hover:bg-muted hover:text-destructive focus-visible:ring-ring flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors select-none"
        >
          <span>{filter.label}</span>
          <X className="text-muted-foreground hover:text-destructive size-3" />
        </button>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs font-semibold"
          onClick={() => {
            router.push(pathname, { scroll: false });
          }}
        >
          <RotateCcw className="size-3" />
          {t("clear_all")}
        </Button>
      )}
    </div>
  );
}
