"use client";

import { useTransition, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Checkbox } from "@nhatnang/ui/components/ui/checkbox";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Label } from "@nhatnang/ui/components/ui/label";
import { Separator } from "@nhatnang/ui/components/ui/separator";
import type { TCategoryWithChildren } from "@nhatnang/database/services";
import type { TBrand } from "@nhatnang/database/schemas";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useDebounce } from "@nhatnang/ui/hooks/use-debounce";

interface ProductFiltersProps {
  categories: TCategoryWithChildren[];
  brands: TBrand[];
  selectedCategorySlug?: string;
}

export function ProductFilters({
  categories,
  brands,
  selectedCategorySlug,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Catalog");
  const [, startTransition] = useTransition();

  // Selected values from URL
  const selectedCategory =
    selectedCategorySlug ?? searchParams.get("category") ?? "";
  const selectedBrands =
    searchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const searchQuery = searchParams.get("q") ?? "";
  const minPower = searchParams.get("minPower") ?? "";
  const maxPower = searchParams.get("maxPower") ?? "";
  const fuelType = searchParams.get("fuelType") ?? "";
  const phase = searchParams.get("phase") ?? "";
  const voltage = searchParams.get("voltage") ?? "";
  const engineBrand = searchParams.get("engineBrand") ?? "";
  const alternatorBrand = searchParams.get("alternatorBrand") ?? "";

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

  // Local state for expandable category nodes
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    [selectedCategory]: true,
  });

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset page cursor when filters change
      params.delete("after");
      params.delete("before");

      Object.entries(updates).forEach(([key, val]) => {
        if (val === null) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const handleBrandChange = (brandSlug: string, checked: boolean) => {
    let newBrands = [...selectedBrands];
    if (checked) {
      newBrands.push(brandSlug);
    } else {
      newBrands = newBrands.filter((slug) => slug !== brandSlug);
    }
    updateFilters({
      brand: newBrands.length > 0 ? newBrands.join(",") : null,
    });
  };

  const handleClearAll = () => {
    // Reset local states immediately
    setLocalSearch("");
    setLocalMinPower("");
    setLocalMaxPower("");
    setLocalVoltage("");
    setLocalEngineBrand("");
    setLocalAlternatorBrand("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  // Utilizing the shared useDebounce hook from @nhatnang/ui
  const debouncedSearch = useDebounce(localSearch, 400);
  const debouncedMinPower = useDebounce(localMinPower, 400);
  const debouncedMaxPower = useDebounce(localMaxPower, 400);
  const debouncedVoltage = useDebounce(localVoltage, 400);
  const debouncedEngineBrand = useDebounce(localEngineBrand, 400);
  const debouncedAlternatorBrand = useDebounce(localAlternatorBrand, 400);

  // Trigger URL parameter updates when debounced values change
  useEffect(() => {
    const updates: Record<string, string | null> = {};

    if (debouncedSearch !== searchQuery) updates["q"] = debouncedSearch || null;
    if (debouncedMinPower !== minPower)
      updates["minPower"] = debouncedMinPower || null;
    if (debouncedMaxPower !== maxPower)
      updates["maxPower"] = debouncedMaxPower || null;
    if (debouncedVoltage !== voltage)
      updates["voltage"] = debouncedVoltage || null;
    if (debouncedEngineBrand !== engineBrand)
      updates["engineBrand"] = debouncedEngineBrand || null;
    if (debouncedAlternatorBrand !== alternatorBrand)
      updates["alternatorBrand"] = debouncedAlternatorBrand || null;

    if (Object.keys(updates).length > 0) {
      updateFilters(updates);
    }
  }, [
    debouncedSearch,
    debouncedMinPower,
    debouncedMaxPower,
    debouncedVoltage,
    debouncedEngineBrand,
    debouncedAlternatorBrand,
    searchQuery,
    minPower,
    maxPower,
    voltage,
    engineBrand,
    alternatorBrand,
    updateFilters,
  ]);

  // Recursive category tree renderer
  const renderCategoryNode = (node: TCategoryWithChildren, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedCategories[node.id];
    const isSelected = selectedCategory === node.slug;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
            isSelected
              ? "bg-primary/10 text-primary font-bold"
              : "hover:bg-muted text-foreground"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            // Clear category from searchParams as it is now a path parameter
            params.delete("category");
            // Reset pagination parameters when category changes
            params.delete("after");
            params.delete("before");

            startTransition(() => {
              if (isSelected) {
                // Deselect category: navigate to default products page
                router.push(`/products?${params.toString()}`, {
                  scroll: false,
                });
              } else {
                // Select category: navigate to path-based category page
                router.push(
                  `/products/category/${node.slug}?${params.toString()}`,
                  { scroll: false },
                );
              }
            });
          }}
        >
          <span>{node.name}</span>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(node.id);
              }}
              className="hover:bg-muted-foreground/10 rounded-sm p-1"
            >
              {isExpanded ? (
                <ChevronDown className="text-muted-foreground h-4.5 w-4.5" />
              ) : (
                <ChevronRight className="text-muted-foreground h-4.5 w-4.5" />
              )}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children!.map((child: TCategoryWithChildren) =>
              renderCategoryNode(child, depth + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Clear Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-bold tracking-tight">
          {t("sidebar.filters")}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs font-semibold"
        >
          {t("sidebar.clear_all")}
          <X className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      <Separator />

      {/* Search Input Box */}
      <div>
        <Input
          type="text"
          placeholder={t("search_placeholder")}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-9 w-full"
        />
      </div>

      <Separator />

      <Separator />

      {/* Categories Tree Accordion */}
      <div>
        <h4 className="text-foreground mb-3 text-sm font-bold">
          {t("sidebar.categories")}
        </h4>
        <div className="space-y-1">
          {categories.map((cat) => renderCategoryNode(cat))}
        </div>
      </div>

      <Separator />

      {/* Brand Checklist */}
      <div>
        <h4 className="text-foreground mb-3 text-sm font-bold">
          {t("sidebar.brands")}
        </h4>
        <div className="space-y-2.5">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2.5">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.slug)}
                onCheckedChange={(checked) =>
                  handleBrandChange(brand.slug, !!checked)
                }
              />
              <Label
                htmlFor={`brand-${brand.id}`}
                className="text-foreground cursor-pointer text-sm leading-none font-medium select-none"
              >
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Power Range Filter (kW) */}
      <div>
        <h4 className="text-foreground mb-3 text-sm font-bold">
          {t("sidebar.power_range")}
        </h4>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder={t("sidebar.placeholder_min")}
            value={localMinPower}
            onChange={(e) => setLocalMinPower(e.target.value)}
            className="h-9 w-full"
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            placeholder={t("sidebar.placeholder_max")}
            value={localMaxPower}
            onChange={(e) => setLocalMaxPower(e.target.value)}
            className="h-9 w-full"
          />
        </div>
      </div>

      <Separator />

      {/* Fuel Type */}
      <div>
        <h4 className="text-foreground mb-3 text-sm font-bold">
          {t("sidebar.fuel_type")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {["gasoline", "diesel", "gas"].map((type) => (
            <Button
              key={type}
              variant={fuelType === type ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateFilters({ fuelType: fuelType === type ? null : type })
              }
              className="h-8.5 rounded-full px-3.5 text-xs font-semibold"
            >
              {type === "gasoline"
                ? "Xăng"
                : type === "diesel"
                  ? "Diesel"
                  : "Gas"}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Phase */}
      <div>
        <h4 className="text-foreground mb-3 text-sm font-bold">
          {t("sidebar.phase")}
        </h4>
        <div className="flex gap-2">
          {["1phase", "3phase"].map((ph) => (
            <Button
              key={ph}
              variant={phase === ph ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ phase: phase === ph ? null : ph })}
              className="h-8.5 rounded-full px-4 text-xs font-semibold"
            >
              {ph === "1phase" ? "1 Pha" : "3 Pha"}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Voltage */}
      <div>
        <h4 className="text-foreground mb-3 text-sm font-bold">
          {t("sidebar.voltage")}
        </h4>
        <Input
          type="number"
          placeholder={t("sidebar.placeholder_voltage")}
          value={localVoltage}
          onChange={(e) => setLocalVoltage(e.target.value)}
          className="h-9 w-full"
        />
      </div>

      <Separator />

      {/* Engine Brand */}
      <div>
        <h4 className="text-foreground mb-3 text-sm font-bold">
          {t("sidebar.engine_brand")}
        </h4>
        <Input
          type="text"
          placeholder={t("sidebar.placeholder_engine_brand")}
          value={localEngineBrand}
          onChange={(e) => setLocalEngineBrand(e.target.value)}
          className="h-9 w-full"
        />
      </div>

      <Separator />

      {/* Alternator Brand */}
      <div>
        <h4 className="text-foreground mb-3 text-sm font-bold">
          {t("sidebar.alternator_brand")}
        </h4>
        <Input
          type="text"
          placeholder={t("sidebar.placeholder_alternator_brand")}
          value={localAlternatorBrand}
          onChange={(e) => setLocalAlternatorBrand(e.target.value)}
          className="h-9 w-full"
        />
      </div>
    </div>
  );
}
