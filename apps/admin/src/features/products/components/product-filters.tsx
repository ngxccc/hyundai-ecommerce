"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@nhatnang/ui/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nhatnang/ui/components/ui/select";
import { Checkbox } from "@nhatnang/ui/components/ui/checkbox";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Search, X } from "lucide-react";
import type { TCategory, TBrand } from "@nhatnang/database/schemas";

interface ProductFiltersProps {
  categories: TCategory[];
  brands: TBrand[];
}

export const ProductFilters = ({ categories, brands }: ProductFiltersProps) => {
  const t = useTranslations("AdminProducts.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "all" || value === "false" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      params.delete("before");
      params.delete("after");

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );
  const [engineBrand, setEngineBrand] = useState(
    searchParams.get("engineBrand") ?? "",
  );
  const [alternatorBrand, setAlternatorBrand] = useState(
    searchParams.get("alternatorBrand") ?? "",
  );
  const [minPower, setMinPower] = useState(searchParams.get("minPower") ?? "");
  const [maxPower, setMaxPower] = useState(searchParams.get("maxPower") ?? "");
  const [voltage, setVoltage] = useState(searchParams.get("voltage") ?? "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedEngineBrand = useDebounce(engineBrand, 500);
  const debouncedAlternatorBrand = useDebounce(alternatorBrand, 500);
  const debouncedMinPower = useDebounce(minPower, 500);
  const debouncedMaxPower = useDebounce(maxPower, 500);
  const debouncedVoltage = useDebounce(voltage, 500);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setEngineBrand("");
    setAlternatorBrand("");
    setMinPower("");
    setMaxPower("");
    setVoltage("");
    router.push(pathname);
  }, [pathname, router]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearchTerm !== currentSearch)
      handleFilterChange("search", debouncedSearchTerm);

    const currentEngineBrand = searchParams.get("engineBrand") ?? "";
    if (debouncedEngineBrand !== currentEngineBrand)
      handleFilterChange("engineBrand", debouncedEngineBrand);

    const currentAlternatorBrand = searchParams.get("alternatorBrand") ?? "";
    if (debouncedAlternatorBrand !== currentAlternatorBrand)
      handleFilterChange("alternatorBrand", debouncedAlternatorBrand);

    const currentMinPower = searchParams.get("minPower") ?? "";
    if (debouncedMinPower !== currentMinPower)
      handleFilterChange("minPower", debouncedMinPower);

    const currentMaxPower = searchParams.get("maxPower") ?? "";
    if (debouncedMaxPower !== currentMaxPower)
      handleFilterChange("maxPower", debouncedMaxPower);

    const currentVoltage = searchParams.get("voltage") ?? "";
    if (debouncedVoltage !== currentVoltage)
      handleFilterChange("voltage", debouncedVoltage);
  }, [
    debouncedSearchTerm,
    debouncedEngineBrand,
    debouncedAlternatorBrand,
    debouncedMinPower,
    debouncedMaxPower,
    debouncedVoltage,
    searchParams,
    handleFilterChange,
  ]);

  const hasFilters =
    searchParams.toString() !== "" ||
    searchTerm !== "" ||
    engineBrand !== "" ||
    alternatorBrand !== "" ||
    minPower !== "" ||
    maxPower !== "" ||
    voltage !== "";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-center gap-2">
        <div className="relative w-full">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="bg-card w-full pl-9 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {hasFilters && (
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="shrink-0 gap-2"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">{t("resetFilters")}</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {/* Category Filter */}
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
                {category.nameVi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand Filter */}
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

        {/* Fuel Type Filter */}
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
            <SelectItem value="gasoline">
              {t("fuelOptions.gasoline")}
            </SelectItem>
            <SelectItem value="gas">{t("fuelOptions.gas")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Phase Filter */}
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

        {/* Status Filter */}
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

        {/* Specs Text Inputs */}
        <div className="relative w-full">
          <Input
            placeholder={t("engineBrand")}
            className="bg-card w-full shadow-sm"
            value={engineBrand}
            onChange={(e) => setEngineBrand(e.target.value)}
          />
        </div>
        <div className="relative w-full">
          <Input
            placeholder={t("alternatorBrand")}
            className="bg-card w-full shadow-sm"
            value={alternatorBrand}
            onChange={(e) => setAlternatorBrand(e.target.value)}
          />
        </div>

        {/* Specs Number Inputs */}
        <div className="relative w-full">
          <Input
            type="number"
            placeholder={t("minPower")}
            className="bg-card w-full shadow-sm"
            value={minPower}
            onChange={(e) => setMinPower(e.target.value)}
          />
        </div>
        <div className="relative w-full">
          <Input
            type="number"
            placeholder={t("maxPower")}
            className="bg-card w-full shadow-sm"
            value={maxPower}
            onChange={(e) => setMaxPower(e.target.value)}
          />
        </div>
        <div className="relative w-full">
          <Input
            type="number"
            placeholder={t("voltage")}
            className="bg-card w-full shadow-sm"
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
          />
        </div>

        {/* Quote Only Toggle */}
        <div className="border-border bg-card flex w-full items-center space-x-2 rounded-md border px-4 py-2 shadow-sm">
          <Checkbox
            id="quote-only"
            checked={searchParams.get("isQuoteOnly") === "true"}
            onCheckedChange={(checked) =>
              handleFilterChange("isQuoteOnly", checked ? "true" : "false")
            }
          />
          <label
            htmlFor="quote-only"
            className="text-muted-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("quoteOnly")}
          </label>
        </div>
      </div>
    </div>
  );
};
