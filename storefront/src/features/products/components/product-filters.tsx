"use client";

import {
  useTransition,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { StorefrontBrand, StorefrontCatalogMetadata } from "@/services";
import { useTranslations, useLocale } from "next-intl";
import { useDebounce } from "@/hooks/use-debounce";

interface ProductFiltersProps {
  brands: StorefrontBrand[];
  mode?: "live" | "sheet";
  onPendingFiltersChange?: (params: URLSearchParams) => void;
  pendingSearchParams?: URLSearchParams | undefined;
  searchParams: Record<string, string | string[] | undefined>;
}

export function ProductFilters({
  brands,
  mode = "live",
  onPendingFiltersChange,
  pendingSearchParams,
  searchParams: searchParamsProp,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(searchParamsProp).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            params.append(key, val);
          });
        } else {
          params.append(key, value);
        }
      }
    });
    return params;
  }, [searchParamsProp]);

  // Fetch real catalog metadata from backend Single Source of Truth
  const locale = useLocale();
  const [metadata, setMetadata] = useState<StorefrontCatalogMetadata | null>(
    null,
  );

  useEffect(() => {
    fetch(`/api/products/metadata?locale=${locale}`)
      .then(
        (res) =>
          res.json() as Promise<{
            status: boolean;
            data: StorefrontCatalogMetadata | null;
          }>,
      )
      .then((resData) => {
        if (resData.status && resData.data) {
          setMetadata(resData.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch filters metadata:", err);
      });
  }, [locale]);

  // Use pending state for display when in sheet mode, otherwise use real URL
  const effectiveSearchParams =
    mode === "sheet" && pendingSearchParams
      ? pendingSearchParams
      : searchParams;

  const t = useTranslations("Catalog");
  const [, startTransition] = useTransition();

  // Selected values from effective params (URL or pending)
  const selectedBrands =
    effectiveSearchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const searchQuery = effectiveSearchParams.get("q") ?? "";
  const minPower = effectiveSearchParams.get("minPower") ?? "";
  const maxPower = effectiveSearchParams.get("maxPower") ?? "";
  const fuelType = effectiveSearchParams.get("fuelType") ?? "";
  const phase = effectiveSearchParams.get("phase") ?? "";
  const voltage = effectiveSearchParams.get("voltage") ?? "";
  const engineBrand = effectiveSearchParams.get("engineBrand") ?? "";
  const alternatorBrand = effectiveSearchParams.get("alternatorBrand") ?? "";

  // Local state for text search & specification filters to prevent typing lag
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localMinPower, setLocalMinPower] = useState(minPower);
  const [localMaxPower, setLocalMaxPower] = useState(maxPower);
  const [localVoltage, setLocalVoltage] = useState(voltage);
  const [localEngineBrand, setLocalEngineBrand] = useState(engineBrand);
  const [localAlternatorBrand, setLocalAlternatorBrand] =
    useState(alternatorBrand);

  // Render-based state synchronization to avoid cascading renders (React 19 pattern)
  const [prevQueryString, setPrevQueryString] = useState(
    searchParams.toString(),
  );
  const currentQueryString = searchParams.toString();

  if (currentQueryString !== prevQueryString) {
    setPrevQueryString(currentQueryString);
    setLocalSearch(searchParams.get("q") ?? "");
    setLocalMinPower(searchParams.get("minPower") ?? "");
    setLocalMaxPower(searchParams.get("maxPower") ?? "");
    setLocalVoltage(searchParams.get("voltage") ?? "");
    setLocalEngineBrand(searchParams.get("engineBrand") ?? "");
    setLocalAlternatorBrand(searchParams.get("alternatorBrand") ?? "");
  }

  // Base navigation update function with Transition
  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(effectiveSearchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset pagination parameters when filters change
      params.delete("after");
      params.delete("before");
      params.delete("page");

      if (mode === "sheet" && onPendingFiltersChange) {
        onPendingFiltersChange(params);
        return;
      }

      startTransition(() => {
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [effectiveSearchParams, mode, onPendingFiltersChange, pathname, router],
  );

  // Debounced search query
  const debouncedSearch = useDebounce(localSearch, 300);
  const debouncedMinPower = useDebounce(localMinPower, 400);
  const debouncedMaxPower = useDebounce(localMaxPower, 400);
  const debouncedVoltage = useDebounce(localVoltage, 400);
  const debouncedEngineBrand = useDebounce(localEngineBrand, 400);
  const debouncedAlternatorBrand = useDebounce(localAlternatorBrand, 400);

  // Sync debounced values to URL
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      updateFilters({ q: debouncedSearch || null });
    }
  }, [debouncedSearch, searchQuery, updateFilters]);

  useEffect(() => {
    const isMinChanged = debouncedMinPower !== minPower;
    const isMaxChanged = debouncedMaxPower !== maxPower;
    const isVoltageChanged = debouncedVoltage !== voltage;
    const isEngineBrandChanged = debouncedEngineBrand !== engineBrand;
    const isAlternatorBrandChanged =
      debouncedAlternatorBrand !== alternatorBrand;

    if (
      isMinChanged ||
      isMaxChanged ||
      isVoltageChanged ||
      isEngineBrandChanged ||
      isAlternatorBrandChanged
    ) {
      updateFilters({
        minPower: debouncedMinPower || null,
        maxPower: debouncedMaxPower || null,
        voltage: debouncedVoltage || null,
        engineBrand: debouncedEngineBrand || null,
        alternatorBrand: debouncedAlternatorBrand || null,
      });
    }
  }, [
    debouncedMinPower,
    debouncedMaxPower,
    debouncedVoltage,
    debouncedEngineBrand,
    debouncedAlternatorBrand,
    minPower,
    maxPower,
    voltage,
    engineBrand,
    alternatorBrand,
    updateFilters,
  ]);

  const handleBrandChange = (brandSlug: string, checked: boolean) => {
    let newBrands = [...selectedBrands];
    if (checked) {
      if (!newBrands.includes(brandSlug)) {
        newBrands.push(brandSlug);
      }
    } else {
      newBrands = newBrands.filter((b) => b !== brandSlug);
    }
    updateFilters({ brand: newBrands.length > 0 ? newBrands.join(",") : null });
  };

  // Only keep brands that exist in the database (count > 0)
  const availableBrands = useMemo(() => {
    if (!metadata?.brands) return brands;
    const existingBrandIds = new Set(
      metadata.brands.filter((b) => b.count > 0).map((b) => b.id),
    );
    return brands.filter((b) => existingBrandIds.has(b.id));
  }, [brands, metadata]);

  // Only keep fuel types that exist in the database (count > 0)
  const availableFuelTypes = useMemo(() => {
    if (!metadata?.fuelTypes) return [];
    return metadata.fuelTypes.filter((f) => f.count > 0 && f.value);
  }, [metadata]);

  // Only keep phases that exist in the database (count > 0)
  const availablePhases = useMemo(() => {
    if (!metadata?.phases) return [];
    return metadata.phases.filter((p) => p.count > 0 && p.value);
  }, [metadata]);

  return (
    <div className="space-y-4 p-4">
      {/* Search Input Box */}
      <div>
        <Input
          type="text"
          placeholder={t("search_placeholder")}
          value={localSearch}
          onChange={(e) => {
            setLocalSearch(e.target.value);
          }}
          className="h-9 w-full"
        />
      </div>

      <Separator />

      {/* Brand Checklist - only render if available brands exist */}
      {availableBrands.length > 0 && (
        <>
          <div>
            <div className="text-foreground mb-2 text-sm font-bold">
              {t("sidebar.brands")}
            </div>
            <div className="space-y-2.5">
              {availableBrands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex cursor-pointer items-center space-x-2.5"
                >
                  <Checkbox
                    checked={selectedBrands.includes(brand.slug)}
                    onCheckedChange={(checked: boolean | "indeterminate") => {
                      handleBrandChange(brand.slug, !!checked);
                    }}
                  />
                  <span className="text-foreground text-sm leading-none font-medium select-none">
                    {brand.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Power Range Filter (kW) */}
      <div>
        <div className="text-foreground mb-2 text-sm font-bold">
          {t("sidebar.power_range")} (kW)
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder={
              metadata?.powerRange.min != null && metadata.powerRange.min > 0
                ? `${metadata.powerRange.min} kW`
                : t("sidebar.placeholder_min")
            }
            value={localMinPower}
            onChange={(e) => {
              setLocalMinPower(e.target.value);
            }}
            className="h-9 w-full"
            min={0}
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            placeholder={
              metadata?.powerRange.max != null && metadata.powerRange.max > 0
                ? `${metadata.powerRange.max} kW`
                : t("sidebar.placeholder_max")
            }
            value={localMaxPower}
            onChange={(e) => {
              setLocalMaxPower(e.target.value);
            }}
            className="h-9 w-full"
            min={0}
          />
        </div>
      </div>

      {/* Fuel Type - only render existing types in database */}
      {availableFuelTypes.length > 0 && (
        <>
          <Separator />
          <div>
            <div className="text-foreground mb-2 text-sm font-bold">
              {t("sidebar.fuel_type")}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableFuelTypes.map((item) => {
                const type = item.value;
                const label =
                  type === "gasoline"
                    ? "Xăng"
                    : type === "diesel"
                      ? "Diesel"
                      : type === "gas"
                        ? "Gas"
                        : type;
                return (
                  <Button
                    key={type}
                    variant={fuelType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      updateFilters({
                        fuelType: fuelType === type ? null : type,
                      });
                    }}
                    className="h-8.5 rounded-full px-3.5 text-xs font-semibold"
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Phase - only render existing phases in database */}
      {availablePhases.length > 0 && (
        <>
          <Separator />
          <div>
            <div className="text-foreground mb-2 text-sm font-bold">
              {t("sidebar.phase")}
            </div>
            <div className="flex gap-2">
              {availablePhases.map((item) => {
                const ph = item.value;
                const label =
                  ph === "1phase" ? "1 Pha" : ph === "3phase" ? "3 Pha" : ph;
                return (
                  <Button
                    key={ph}
                    variant={phase === ph ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      updateFilters({ phase: phase === ph ? null : ph });
                    }}
                    className="h-8.5 rounded-full px-4 text-xs font-semibold"
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Voltage */}
      <div>
        <div className="text-foreground mb-2 text-sm font-bold">
          {t("sidebar.voltage")} (V)
        </div>
        <Input
          type="number"
          placeholder={t("sidebar.placeholder_voltage")}
          value={localVoltage}
          onChange={(e) => {
            setLocalVoltage(e.target.value);
          }}
          className="h-9 w-full"
          min={0}
        />
      </div>

      <Separator />

      {/* Engine Brand */}
      <div>
        <div className="text-foreground mb-2 text-sm font-bold">
          {t("sidebar.engine_brand")}
        </div>
        <Input
          type="text"
          placeholder={t("sidebar.placeholder_engine_brand")}
          value={localEngineBrand}
          onChange={(e) => {
            setLocalEngineBrand(e.target.value);
          }}
          className="h-9 w-full"
        />
      </div>

      <Separator />

      {/* Alternator Brand */}
      <div>
        <div className="text-foreground mb-2 text-sm font-bold">
          {t("sidebar.alternator_brand")}
        </div>
        <Input
          type="text"
          placeholder={t("sidebar.placeholder_alternator_brand")}
          value={localAlternatorBrand}
          onChange={(e) => {
            setLocalAlternatorBrand(e.target.value);
          }}
          className="h-9 w-full"
        />
      </div>
    </div>
  );
}
