"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { AdminCategory, AdminBrand } from "@/types/api";

interface ProductFiltersProps {
  categories: AdminCategory[];
  brands: AdminBrand[];
}

export const ProductFilters = ({ categories, brands }: ProductFiltersProps) => {
  const t = useTranslations("adminProducts.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Desktop search input state
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Mobile local draft filter state
  const [draftFilters, setDraftFilters] = useState({
    categoryId: searchParams.get("categoryId") ?? "all",
    brandId: searchParams.get("brandId") ?? "all",
    fuelType: searchParams.get("fuelType") ?? "all",
    phase: searchParams.get("phase") ?? "all",
    status: searchParams.get("status") ?? "all",
    engineBrand: searchParams.get("engineBrand") ?? "",
    alternatorBrand: searchParams.get("alternatorBrand") ?? "",
    minPower: searchParams.get("minPower") ?? "",
    maxPower: searchParams.get("maxPower") ?? "",
    voltage: searchParams.get("voltage") ?? "",
    isQuoteOnly: searchParams.get("isQuoteOnly") === "true",
  });

  // Sync draft filters when sheet opens
  const handleOpenSheet = (open: boolean) => {
    if (open) {
      setDraftFilters({
        categoryId: searchParams.get("categoryId") ?? "all",
        brandId: searchParams.get("brandId") ?? "all",
        fuelType: searchParams.get("fuelType") ?? "all",
        phase: searchParams.get("phase") ?? "all",
        status: searchParams.get("status") ?? "all",
        engineBrand: searchParams.get("engineBrand") ?? "",
        alternatorBrand: searchParams.get("alternatorBrand") ?? "",
        minPower: searchParams.get("minPower") ?? "",
        maxPower: searchParams.get("maxPower") ?? "",
        voltage: searchParams.get("voltage") ?? "",
        isQuoteOnly: searchParams.get("isQuoteOnly") === "true",
      });
    }
    setIsSheetOpen(open);
  };

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "all" || value === "false" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      params.delete("page");
      params.delete("before");
      params.delete("after");

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setDraftFilters({
      categoryId: "all",
      brandId: "all",
      fuelType: "all",
      phase: "all",
      status: "all",
      engineBrand: "",
      alternatorBrand: "",
      minPower: "",
      maxPower: "",
      voltage: "",
      isQuoteOnly: false,
    });
    router.push(pathname);
    setIsSheetOpen(false);
  }, [pathname, router]);

  const handleApplyMobileFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Apply all draft filters at once
    const filterKeys: (keyof typeof draftFilters)[] = [
      "categoryId",
      "brandId",
      "fuelType",
      "phase",
      "status",
      "engineBrand",
      "alternatorBrand",
      "minPower",
      "maxPower",
      "voltage",
    ];

    for (const key of filterKeys) {
      const val = draftFilters[key];
      if (typeof val === "string") {
        if (val === "all" || val.trim() === "") {
          params.delete(key);
        } else {
          params.set(key, val.trim());
        }
      }
    }

    if (draftFilters.isQuoteOnly) {
      params.set("isQuoteOnly", "true");
    } else {
      params.delete("isQuoteOnly");
    }

    params.delete("page");
    params.delete("before");
    params.delete("after");

    router.push(`${pathname}?${params.toString()}`);
    setIsSheetOpen(false);
  };

  // Debounced search sync for desktop/mobile search bar
  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearchTerm !== currentSearch) {
      handleFilterChange("search", debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchParams, handleFilterChange]);

  // Count how many filters are active (excluding search)
  const activeFilterCount = [
    searchParams.get("categoryId"),
    searchParams.get("brandId"),
    searchParams.get("fuelType"),
    searchParams.get("phase"),
    searchParams.get("status"),
    searchParams.get("engineBrand"),
    searchParams.get("alternatorBrand"),
    searchParams.get("minPower"),
    searchParams.get("maxPower"),
    searchParams.get("voltage"),
    searchParams.get("isQuoteOnly"),
  ].filter(
    (val) => val !== null && val !== "" && val !== "all" && val !== "false",
  ).length;

  const hasFilters = searchParams.toString() !== "" || searchTerm !== "";

  {
    /* Desktop Filter Fields (direct change) */
  }
  const renderDesktopFilters = () => (
    <>
      <Select
        defaultValue={searchParams.get("categoryId") ?? "all"}
        onValueChange={(value) => handleFilterChange("categoryId", value)}
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allCategories")}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("brandId") ?? "all"}
        onValueChange={(value) => handleFilterChange("brandId", value)}
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allBrands")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allBrands")}</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("fuelType") ?? "all"}
        onValueChange={(value) => handleFilterChange("fuelType", value)}
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allFuels")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allFuels")}</SelectItem>
          <SelectItem value="diesel">{t("fuelOptions.diesel")}</SelectItem>
          <SelectItem value="gasoline">{t("fuelOptions.gasoline")}</SelectItem>
          <SelectItem value="gas">{t("fuelOptions.gas")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("phase") ?? "all"}
        onValueChange={(value) => handleFilterChange("phase", value)}
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allPhases")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allPhases")}</SelectItem>
          <SelectItem value="1phase">{t("phaseOptions.1phase")}</SelectItem>
          <SelectItem value="3phase">{t("phaseOptions.3phase")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(value) => handleFilterChange("status", value)}
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("status")}</SelectItem>
          <SelectItem value="active">{t("statusOptions.active")}</SelectItem>
          <SelectItem value="outOfStock">
            {t("statusOptions.outOfStock")}
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="relative w-full">
        <Input
          placeholder={t("engineBrand")}
          className="bg-card w-full shadow-sm"
          defaultValue={searchParams.get("engineBrand") ?? ""}
          onBlur={(e) => handleFilterChange("engineBrand", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFilterChange("engineBrand", e.currentTarget.value);
            }
          }}
        />
      </div>
      <div className="relative w-full">
        <Input
          placeholder={t("alternatorBrand")}
          className="bg-card w-full shadow-sm"
          defaultValue={searchParams.get("alternatorBrand") ?? ""}
          onBlur={(e) => handleFilterChange("alternatorBrand", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFilterChange("alternatorBrand", e.currentTarget.value);
            }
          }}
        />
      </div>

      <div className="relative w-full">
        <Input
          type="number"
          placeholder={t("minPower")}
          className="bg-card w-full shadow-sm"
          defaultValue={searchParams.get("minPower") ?? ""}
          onBlur={(e) => handleFilterChange("minPower", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFilterChange("minPower", e.currentTarget.value);
            }
          }}
        />
      </div>
      <div className="relative w-full">
        <Input
          type="number"
          placeholder={t("maxPower")}
          className="bg-card w-full shadow-sm"
          defaultValue={searchParams.get("maxPower") ?? ""}
          onBlur={(e) => handleFilterChange("maxPower", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFilterChange("maxPower", e.currentTarget.value);
            }
          }}
        />
      </div>
      <div className="relative w-full">
        <Input
          type="number"
          placeholder={t("voltage")}
          className="bg-card w-full shadow-sm"
          defaultValue={searchParams.get("voltage") ?? ""}
          onBlur={(e) => handleFilterChange("voltage", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFilterChange("voltage", e.currentTarget.value);
            }
          }}
        />
      </div>

      <Label
        htmlFor="quote-only"
        className="border-border bg-card hover:bg-accent/40 text-muted-foreground flex w-full cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors select-none"
      >
        <Checkbox
          id="quote-only"
          checked={searchParams.get("isQuoteOnly") === "true"}
          onCheckedChange={(checked) =>
            handleFilterChange("isQuoteOnly", checked ? "true" : "false")
          }
        />
        <span>{t("quoteOnly")}</span>
      </Label>
    </>
  );

  {
    /* Mobile Draft Filter Fields (accumulate state) */
  }
  const renderMobileDraftFilters = () => (
    <>
      <Select
        value={draftFilters.categoryId}
        onValueChange={(val) =>
          setDraftFilters((prev) => ({ ...prev, categoryId: val }))
        }
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allCategories")}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={draftFilters.brandId}
        onValueChange={(val) =>
          setDraftFilters((prev) => ({ ...prev, brandId: val }))
        }
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allBrands")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allBrands")}</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={draftFilters.fuelType}
        onValueChange={(val) =>
          setDraftFilters((prev) => ({ ...prev, fuelType: val }))
        }
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allFuels")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allFuels")}</SelectItem>
          <SelectItem value="diesel">{t("fuelOptions.diesel")}</SelectItem>
          <SelectItem value="gasoline">{t("fuelOptions.gasoline")}</SelectItem>
          <SelectItem value="gas">{t("fuelOptions.gas")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={draftFilters.phase}
        onValueChange={(val) =>
          setDraftFilters((prev) => ({ ...prev, phase: val }))
        }
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allPhases")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allPhases")}</SelectItem>
          <SelectItem value="1phase">{t("phaseOptions.1phase")}</SelectItem>
          <SelectItem value="3phase">{t("phaseOptions.3phase")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={draftFilters.status}
        onValueChange={(val) =>
          setDraftFilters((prev) => ({ ...prev, status: val }))
        }
      >
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("status")}</SelectItem>
          <SelectItem value="active">{t("statusOptions.active")}</SelectItem>
          <SelectItem value="outOfStock">
            {t("statusOptions.outOfStock")}
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="relative w-full">
        <Input
          placeholder={t("engineBrand")}
          className="bg-card w-full shadow-sm"
          value={draftFilters.engineBrand}
          onChange={(e) =>
            setDraftFilters((prev) => ({
              ...prev,
              engineBrand: e.target.value,
            }))
          }
        />
      </div>
      <div className="relative w-full">
        <Input
          placeholder={t("alternatorBrand")}
          className="bg-card w-full shadow-sm"
          value={draftFilters.alternatorBrand}
          onChange={(e) =>
            setDraftFilters((prev) => ({
              ...prev,
              alternatorBrand: e.target.value,
            }))
          }
        />
      </div>

      <div className="relative w-full">
        <Input
          type="number"
          placeholder={t("minPower")}
          className="bg-card w-full shadow-sm"
          value={draftFilters.minPower}
          onChange={(e) =>
            setDraftFilters((prev) => ({
              ...prev,
              minPower: e.target.value,
            }))
          }
        />
      </div>
      <div className="relative w-full">
        <Input
          type="number"
          placeholder={t("maxPower")}
          className="bg-card w-full shadow-sm"
          value={draftFilters.maxPower}
          onChange={(e) =>
            setDraftFilters((prev) => ({
              ...prev,
              maxPower: e.target.value,
            }))
          }
        />
      </div>
      <div className="relative w-full">
        <Input
          type="number"
          placeholder={t("voltage")}
          className="bg-card w-full shadow-sm"
          value={draftFilters.voltage}
          onChange={(e) =>
            setDraftFilters((prev) => ({
              ...prev,
              voltage: e.target.value,
            }))
          }
        />
      </div>

      <Label
        htmlFor="quote-only-mobile"
        className="border-border bg-card hover:bg-accent/40 text-muted-foreground col-span-full flex w-full cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors select-none"
      >
        <Checkbox
          id="quote-only-mobile"
          checked={draftFilters.isQuoteOnly}
          onCheckedChange={(checked) =>
            setDraftFilters((prev) => ({
              ...prev,
              isQuoteOnly: checked === true,
            }))
          }
        />
        <span>{t("quoteOnly")}</span>
      </Label>
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Search Bar + Mobile Drawer Trigger + Reset */}
      <div className="flex w-full items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="bg-card w-full pl-9 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Mobile Filter Drawer (Bottom Sheet) */}
        <div className="lg:hidden">
          <Sheet open={isSheetOpen} onOpenChange={handleOpenSheet}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="relative shrink-0 gap-2 shadow-xs"
              >
                <SlidersHorizontal className="size-4" />
                <span>{t("filterButton")}</span>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-primary text-primary-foreground ml-0.5 px-1.5 py-0 text-[10px] font-bold"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] gap-0 rounded-t-2xl p-0"
            >
              <SheetHeader className="border-border/60 border-b p-4 text-left">
                <div className="flex items-center justify-between pr-6">
                  <div>
                    <SheetTitle className="text-base font-semibold">
                      {t("filterTitle")}
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                      {t("filterDescription")}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <div className="grid max-h-[calc(85vh-140px)] grid-cols-1 gap-2.5 overflow-y-auto p-4 sm:grid-cols-2">
                {renderMobileDraftFilters()}
              </div>
              <SheetFooter className="border-border/60 bg-muted/20 border-t p-3">
                <div className="flex w-full items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResetFilters}
                    className="text-muted-foreground hover:text-foreground text-xs font-medium"
                  >
                    {t("resetFilters")}
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleApplyMobileFilters}
                    className="flex-1 font-semibold sm:flex-initial"
                  >
                    {t("applyFilters")}
                  </Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Reset button for desktop / when search is filled */}
        {hasFilters && (
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="hidden shrink-0 gap-2 lg:flex"
          >
            <X className="h-4 w-4" />
            <span>{t("resetFilters")}</span>
          </Button>
        )}
      </div>

      {/* Desktop Filter Grid (Grid cols 6) */}
      <div className="hidden grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid lg:grid-cols-6">
        {renderDesktopFilters()}
      </div>
    </div>
  );
};
