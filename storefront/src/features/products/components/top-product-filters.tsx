"use client";

import {
  useState,
  useTransition,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Zap,
  Building2,
  Flame,
  Activity,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProductSort } from "./product-sort";
import { ProductFilterSheet } from "./product-filter-sheet";
import type { StorefrontBrand, StorefrontCatalogMetadata } from "@/services";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TopProductFiltersProps {
  brands: StorefrontBrand[];
  metadata: StorefrontCatalogMetadata | null;
}

export function TopProductFilters({
  brands,
  metadata,
}: TopProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("Catalog");

  // URL state
  const searchQuery = searchParams.get("q") ?? "";
  const selectedBrands = useMemo(
    () => searchParams.get("brand")?.split(",").filter(Boolean) ?? [],
    [searchParams],
  );
  const minPower = searchParams.get("minPower") ?? "";
  const maxPower = searchParams.get("maxPower") ?? "";
  const selectedFuelType = searchParams.get("fuelType") ?? "";
  const selectedPhase = searchParams.get("phase") ?? "";

  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Local state for power popover
  const [localMinPower, setLocalMinPower] = useState(minPower);
  const [localMaxPower, setLocalMaxPower] = useState(maxPower);
  const [powerPopoverOpen, setPowerPopoverOpen] = useState(false);

  // Synchronize local search with URL search param
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
  }

  // Base update helper
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete("after");
      params.delete("before");
      params.delete("page");

      startTransition(() => {
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  // Sync debounced search
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      updateQueryParams({ q: debouncedSearch || null });
    }
  }, [debouncedSearch, searchQuery, updateQueryParams]);

  // Brand multi-select toggle
  const handleBrandToggle = (brandSlug: string) => {
    let next = [...selectedBrands];
    if (next.includes(brandSlug)) {
      next = next.filter((b) => b !== brandSlug);
    } else {
      next.push(brandSlug);
    }
    updateQueryParams({ brand: next.length > 0 ? next.join(",") : null });
  };

  // Power range apply
  const handleApplyPower = () => {
    updateQueryParams({
      minPower: localMinPower || null,
      maxPower: localMaxPower || null,
    });
    setPowerPopoverOpen(false);
  };

  const handleClearPower = () => {
    setLocalMinPower("");
    setLocalMaxPower("");
    updateQueryParams({
      minPower: null,
      maxPower: null,
    });
    setPowerPopoverOpen(false);
  };

  // Only keep brands that have products (count > 0)
  const availableBrands = useMemo(() => {
    if (!metadata?.brands) return brands;
    const existingBrandIds = new Set(
      metadata.brands.filter((b) => b.count > 0).map((b) => b.id),
    );
    return brands.filter((b) => existingBrandIds.has(b.id));
  }, [brands, metadata]);

  // Only keep fuel types with count > 0
  const availableFuelTypes = useMemo(() => {
    if (!metadata?.fuelTypes) return [];
    return metadata.fuelTypes.filter((f) => f.count > 0 && f.value);
  }, [metadata]);

  // Only keep phases with count > 0
  const availablePhases = useMemo(() => {
    if (!metadata?.phases) return [];
    return metadata.phases.filter((p) => p.count > 0 && p.value);
  }, [metadata]);

  // Total active advanced filters (for the sheet badge)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchParams.get("q")) count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (searchParams.get("minPower") || searchParams.get("maxPower")) count++;
    if (searchParams.get("fuelType")) count++;
    if (searchParams.get("phase")) count++;
    if (searchParams.get("voltage")) count++;
    if (searchParams.get("engineBrand")) count++;
    if (searchParams.get("alternatorBrand")) count++;
    return count;
  }, [searchParams, selectedBrands.length]);

  const isPowerActive = Boolean(minPower || maxPower);

  const getFuelLabel = (type: string) =>
    type === "gasoline"
      ? "Xăng"
      : type === "diesel"
        ? "Diesel"
        : type === "gas"
          ? "Gas"
          : type;

  const getPhaseLabel = (ph: string) =>
    ph === "1phase" ? "1 Pha" : ph === "3phase" ? "3 Pha" : ph;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Compact Search Input Box */}
      <div className="relative w-36 shrink-0 sm:w-48">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          type="text"
          placeholder={t("search_placeholder")}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-8.5 pr-7 pl-8 text-xs"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch("");
              updateQueryParams({ q: null });
            }}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-0.5"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Brand Filter Popover */}
      {availableBrands.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={selectedBrands.length > 0 ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8.5 shrink-0 gap-1.5 px-2.5 text-xs font-semibold select-none",
                selectedBrands.length > 0
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Building2 className="size-3.5" />
              <span>{t("sidebar.brands")}</span>
              {selectedBrands.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold"
                >
                  {selectedBrands.length}
                </Badge>
              )}
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              <div className="text-muted-foreground px-2 py-1 text-xs font-semibold tracking-wider uppercase">
                {t("sidebar.brands")}
              </div>
              <div className="max-h-56 space-y-1 overflow-y-auto">
                {availableBrands.map((brand) => {
                  const isSelected = selectedBrands.includes(brand.slug);
                  return (
                    <div
                      key={brand.id}
                      onClick={() => handleBrandToggle(brand.slug)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors select-none",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-muted text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={isSelected} className="size-3.5" />
                        <span>{brand.name}</span>
                      </div>
                      {isSelected && <Check className="size-3.5" />}
                    </div>
                  );
                })}
              </div>
              {selectedBrands.length > 0 && (
                <div className="border-t pt-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQueryParams({ brand: null })}
                    className="text-muted-foreground hover:text-foreground h-7 w-full text-xs"
                  >
                    {t("sidebar.clear_all")}
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Power Range Popover */}
      <Popover open={powerPopoverOpen} onOpenChange={setPowerPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isPowerActive ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8.5 shrink-0 gap-1.5 px-2.5 text-xs font-semibold select-none",
              isPowerActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted",
            )}
          >
            <Zap className="size-3.5" />
            <span>
              {isPowerActive
                ? minPower && maxPower
                  ? `${minPower} - ${maxPower} kW`
                  : minPower
                    ? `≥ ${minPower} kW`
                    : `≤ ${maxPower} kW`
                : "Công suất"}
            </span>
            <ChevronDown className="size-3 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3.5" align="start">
          <div className="space-y-3">
            <div className="text-foreground text-xs font-bold">
              Công suất (kW)
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={
                  metadata?.powerRange.min != null &&
                  metadata.powerRange.min > 0
                    ? `${metadata.powerRange.min} kW`
                    : t("sidebar.placeholder_min")
                }
                value={localMinPower}
                onChange={(e) => setLocalMinPower(e.target.value)}
                className="h-8 text-xs"
                min={0}
              />
              <span className="text-muted-foreground text-xs">—</span>
              <Input
                type="number"
                placeholder={
                  metadata?.powerRange.max != null &&
                  metadata.powerRange.max > 0
                    ? `${metadata.powerRange.max} kW`
                    : t("sidebar.placeholder_max")
                }
                value={localMaxPower}
                onChange={(e) => setLocalMaxPower(e.target.value)}
                className="h-8 text-xs"
                min={0}
              />
            </div>
            <div className="flex items-center justify-between gap-2 border-t pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearPower}
                className="h-7 text-xs"
              >
                {t("sidebar.clear_all")}
              </Button>
              <Button
                size="sm"
                onClick={handleApplyPower}
                className="h-7 px-3 text-xs font-semibold"
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Fuel Type Popover */}
      {availableFuelTypes.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={selectedFuelType ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8.5 shrink-0 gap-1.5 px-2.5 text-xs font-semibold select-none",
                selectedFuelType
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Flame className="size-3.5" />
              <span>
                {selectedFuelType
                  ? getFuelLabel(selectedFuelType)
                  : "Nhiên liệu"}
              </span>
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1.5" align="start">
            <div className="space-y-1">
              <div
                onClick={() => updateQueryParams({ fuelType: null })}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors select-none",
                  !selectedFuelType
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted text-foreground",
                )}
              >
                <span>Tất cả nhiên liệu</span>
                {!selectedFuelType && <Check className="size-3.5" />}
              </div>
              {availableFuelTypes.map((item) => {
                const type = item.value;
                const isSelected = selectedFuelType === type;
                return (
                  <div
                    key={type}
                    onClick={() =>
                      updateQueryParams({
                        fuelType: isSelected ? null : type,
                      })
                    }
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors select-none",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-foreground",
                    )}
                  >
                    <span>{getFuelLabel(type)}</span>
                    {isSelected && <Check className="size-3.5" />}
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Phase Popover */}
      {availablePhases.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={selectedPhase ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8.5 shrink-0 gap-1.5 px-2.5 text-xs font-semibold select-none",
                selectedPhase
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Activity className="size-3.5" />
              <span>
                {selectedPhase ? getPhaseLabel(selectedPhase) : "Số pha"}
              </span>
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1.5" align="start">
            <div className="space-y-1">
              <div
                onClick={() => updateQueryParams({ phase: null })}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors select-none",
                  !selectedPhase
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted text-foreground",
                )}
              >
                <span>Tất cả số pha</span>
                {!selectedPhase && <Check className="size-3.5" />}
              </div>
              {availablePhases.map((item) => {
                const ph = item.value;
                const isSelected = selectedPhase === ph;
                return (
                  <div
                    key={ph}
                    onClick={() =>
                      updateQueryParams({
                        phase: isSelected ? null : ph,
                      })
                    }
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors select-none",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-foreground",
                    )}
                  >
                    <span>{getPhaseLabel(ph)}</span>
                    {isSelected && <Check className="size-3.5" />}
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Right Side Controls: Advanced Filter Drawer & Sort Selector */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* Advanced Filter Drawer Trigger */}
        <ProductFilterSheet
          brands={brands}
          searchParams={Object.fromEntries(searchParams.entries())}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 gap-1.5 px-2.5 text-xs font-semibold select-none"
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">Bộ lọc khác</span>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          }
        />

        {/* Sort Selector */}
        <ProductSort
          currentSort={searchParams.get("sort") ?? "newest"}
          searchParams={Object.fromEntries(searchParams.entries())}
        />
      </div>
    </div>
  );
}
