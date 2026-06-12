"use client";

import { useTransition, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Checkbox } from "@nhatnang/ui/components/ui/checkbox";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Separator } from "@nhatnang/ui/components/ui/separator";
import type {
  StorefrontCategoryWithChildren,
  StorefrontBrand,
  StorefrontFilterMetadata,
} from "@/shared/services";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useDebounce } from "@nhatnang/ui/hooks/use-debounce";
import { computeFacets } from "../utils/facet-engine";
import type {
  ComputeFacetsParams,
  ProductActiveFilters,
} from "../types/facet-engine";
import { FUEL_TYPES, PHASES } from "@nhatnang/database/validators";

interface ProductFiltersProps {
  categories: StorefrontCategoryWithChildren[];
  brands: StorefrontBrand[];
  selectedCategorySlug?: string;
  mode?: "live" | "sheet";
  onPendingFiltersChange?: (params: URLSearchParams) => void;
  pendingSearchParams?: URLSearchParams | undefined;
  searchParams: Record<string, string | string[] | undefined>;
}

function flattenCategoriesTree(
  tree: StorefrontCategoryWithChildren[],
  parentId: string | null = null,
) {
  const result: ComputeFacetsParams["categories"] = [];
  for (const node of tree) {
    result.push({
      id: node.id,
      slug: node.slug,
      parentId,
    });
    if (node.children && node.children.length > 0) {
      result.push(...flattenCategoriesTree(node.children, node.id));
    }
  }
  return result;
}

export function ProductFilters({
  categories,
  brands,
  selectedCategorySlug,
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
          value.forEach((val) => params.append(key, val));
        } else {
          params.append(key, value);
        }
      }
    });
    return params;
  }, [searchParamsProp]);
  // Fetch metadata once on mount
  const [metadata, setMetadata] = useState<StorefrontFilterMetadata[]>([]);
  useEffect(() => {
    fetch("/api/products/metadata")
      .then(
        (res) =>
          res.json() as Promise<{
            status: boolean;
            data: StorefrontFilterMetadata[];
          }>,
      )
      .then((resData) => {
        if (resData.status && Array.isArray(resData.data)) {
          setMetadata(resData.data);
        }
      })
      .catch((err) => console.error("Failed to fetch filters metadata:", err));
  }, []);

  // Use pending state for display when in sheet mode, otherwise use real URL
  const effectiveSearchParams =
    mode === "sheet" && pendingSearchParams
      ? pendingSearchParams
      : searchParams;

  const t = useTranslations("Catalog");
  const [, startTransition] = useTransition();

  // Selected values from effective params (URL or pending)
  const selectedCategory =
    effectiveSearchParams.get("category") ?? selectedCategorySlug ?? "";
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

  // Compute active filters and facetStatus
  const activeFilters: ProductActiveFilters = {
    categorySlug: selectedCategory || null,
    brandSlugs: selectedBrands,
    fuelType: fuelType || null,
    phase: phase || null,
    minPower: minPower ? Number(minPower) : null,
    maxPower: maxPower ? Number(maxPower) : null,
    voltage: voltage ? Number(voltage) : null,
    engineBrand: engineBrand || null,
    alternatorBrand: alternatorBrand || null,
    q: searchQuery || null,
  };

  const facetStatus =
    metadata.length > 0
      ? computeFacets({
          products: metadata,
          brands,
          categories: flattenCategoriesTree(categories),
          activeFilters,
        })
      : null;

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
      const params = new URLSearchParams(effectiveSearchParams.toString());

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

      if (mode === "sheet") {
        // Sheet mode: NEVER navigate. Only report to parent if callback exists.
        if (onPendingFiltersChange) {
          onPendingFiltersChange(params);
        }
      } else {
        // Live mode (Desktop): navigate immediately.
        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
      }
    },
    [effectiveSearchParams, mode, onPendingFiltersChange, router, pathname],
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

  const debouncedSearch = useDebounce(localSearch, 400);
  const debouncedMinPower = useDebounce(localMinPower, 400);
  const debouncedMaxPower = useDebounce(localMaxPower, 400);
  const debouncedVoltage = useDebounce(localVoltage, 400);
  const debouncedEngineBrand = useDebounce(localEngineBrand, 400);
  const debouncedAlternatorBrand = useDebounce(localAlternatorBrand, 400);

  // Trigger URL parameter updates when debounced values change
  useEffect(() => {
    const updates: Record<string, string | null> = {};

    if (debouncedSearch !== searchQuery && debouncedSearch === localSearch)
      updates["q"] = debouncedSearch || null;
    if (debouncedMinPower !== minPower && debouncedMinPower === localMinPower)
      updates["minPower"] = debouncedMinPower || null;
    if (debouncedMaxPower !== maxPower && debouncedMaxPower === localMaxPower)
      updates["maxPower"] = debouncedMaxPower || null;
    if (debouncedVoltage !== voltage && debouncedVoltage === localVoltage)
      updates["voltage"] = debouncedVoltage || null;
    if (
      debouncedEngineBrand !== engineBrand &&
      debouncedEngineBrand === localEngineBrand
    )
      updates["engineBrand"] = debouncedEngineBrand || null;
    if (
      debouncedAlternatorBrand !== alternatorBrand &&
      debouncedAlternatorBrand === localAlternatorBrand
    )
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
    localSearch,
    localMinPower,
    localMaxPower,
    localVoltage,
    localEngineBrand,
    localAlternatorBrand,
    updateFilters,
  ]);

  // Recursive category tree renderer
  const renderCategoryNode = (node: StorefrontCategoryWithChildren, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedCategories[node.id];
    const isSelected = selectedCategory === node.slug;
    const isDisabled = facetStatus ? !facetStatus.categories[node.slug] : false;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
            isSelected
              ? "bg-primary/10 text-primary font-bold"
              : isDisabled
                ? "text-muted-foreground pointer-events-none cursor-not-allowed opacity-50"
                : "hover:bg-muted text-foreground cursor-pointer"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (isDisabled) return;
            const params = new URLSearchParams(
              effectiveSearchParams.toString(),
            );
            // Clear category from searchParams as it is now a path parameter
            params.delete("category");
            // Reset pagination parameters when category changes
            params.delete("after");
            params.delete("before");

            startTransition(() => {
              if (mode === "sheet" && onPendingFiltersChange) {
                // In sheet mode, report the category change to the parent
                // without navigating. The parent will apply it on "Apply".
                const newParams = new URLSearchParams(params.toString());
                if (isSelected) {
                  newParams.delete("category");
                } else {
                  // Note: Category slug navigation in sheet mode is complex
                  // as it changes the route segment. For simplicity in Phase 2,
                  // we treat category as a filter param inside the sheet.
                  newParams.set("category", node.slug);
                }
                onPendingFiltersChange(newParams);
              } else {
                // Live mode (Desktop Sidebar)
                if (isSelected) {
                  router.push(`/products?${params.toString()}`, {
                    scroll: false,
                  });
                } else {
                  router.push(
                    `/products/category/${node.slug}?${params.toString()}`,
                    { scroll: false },
                  );
                }
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
              aria-label={
                isExpanded
                  ? t("sidebar.collapse_category")
                  : t("sidebar.expand_category")
              }
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
            {node.children.map((child: StorefrontCategoryWithChildren) =>
              renderCategoryNode(child, depth + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
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

      {/* Categories Tree Accordion */}
      <div>
        <div className="text-foreground mb-1 text-sm font-bold">
          {t("sidebar.categories")}
        </div>
        <div className="space-y-1">
          {categories.map((cat) => renderCategoryNode(cat))}
        </div>
      </div>

      <Separator />

      {/* Brand Checklist */}
      <div>
        <div className="text-foreground mb-1 text-sm font-bold">
          {t("sidebar.brands")}
        </div>
        <div className="space-y-2.5">
          {brands.map((brand) => {
            const isBrandDisabled = facetStatus
              ? !facetStatus.brands[brand.slug]
              : false;
            return (
              <label
                key={brand.id}
                aria-disabled={isBrandDisabled}
                className={`flex items-center space-x-2.5 ${
                  isBrandDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <Checkbox
                  checked={selectedBrands.includes(brand.slug)}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand.slug, !!checked)
                  }
                  disabled={isBrandDisabled}
                />
                <span className="text-foreground text-sm leading-none font-medium select-none">
                  {brand.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Power Range Filter (kW) */}
      <div>
        <div className="text-foreground mb-1 text-sm font-bold">
          {t("sidebar.power_range")}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder={t("sidebar.placeholder_min")}
            value={localMinPower}
            onChange={(e) => setLocalMinPower(e.target.value)}
            className="h-9 w-full"
            min={0}
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            placeholder={t("sidebar.placeholder_max")}
            value={localMaxPower}
            onChange={(e) => setLocalMaxPower(e.target.value)}
            className="h-9 w-full"
            min={0}
          />
        </div>
      </div>

      <Separator />

      {/* Fuel Type */}
      <div>
        <div className="text-foreground mb-1 text-sm font-bold">
          {t("sidebar.fuel_type")}
        </div>
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((type) => {
            const isFuelDisabled = facetStatus
              ? !facetStatus.fuelTypes[type]
              : false;
            return (
              <Button
                key={type}
                variant={fuelType === type ? "default" : "outline"}
                size="sm"
                disabled={isFuelDisabled}
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
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Phase */}
      <div>
        <div className="text-foreground mb-1 text-sm font-bold">
          {t("sidebar.phase")}
        </div>
        <div className="flex gap-2">
          {PHASES.map((ph) => {
            const isPhaseDisabled = facetStatus
              ? !facetStatus.phases[ph]
              : false;
            return (
              <Button
                key={ph}
                variant={phase === ph ? "default" : "outline"}
                size="sm"
                disabled={isPhaseDisabled}
                onClick={() =>
                  updateFilters({ phase: phase === ph ? null : ph })
                }
                className="h-8.5 rounded-full px-4 text-xs font-semibold"
              >
                {ph === "1phase" ? "1 Pha" : "3 Pha"}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Voltage */}
      <div>
        <div className="text-foreground mb-1 text-sm font-bold">
          {t("sidebar.voltage")}
        </div>
        <Input
          type="number"
          placeholder={t("sidebar.placeholder_voltage")}
          value={localVoltage}
          onChange={(e) => setLocalVoltage(e.target.value)}
          className="h-9 w-full"
          min={0}
        />
      </div>

      <Separator />

      {/* Engine Brand */}
      <div>
        <div className="text-foreground mb-1 text-sm font-bold">
          {t("sidebar.engine_brand")}
        </div>
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
        <div className="text-foreground mb-1 text-sm font-bold">
          {t("sidebar.alternator_brand")}
        </div>
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
