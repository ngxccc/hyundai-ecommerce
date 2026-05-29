"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Search } from "lucide-react";
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

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [engineBrand, setEngineBrand] = useState(searchParams.get("engineBrand") ?? "");
  const [alternatorBrand, setAlternatorBrand] = useState(searchParams.get("alternatorBrand") ?? "");
  const [minPower, setMinPower] = useState(searchParams.get("minPower") ?? "");
  const [maxPower, setMaxPower] = useState(searchParams.get("maxPower") ?? "");
  const [voltage, setVoltage] = useState(searchParams.get("voltage") ?? "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = searchParams.get("search") ?? "";
      if (searchTerm !== currentSearch) handleFilterChange("search", searchTerm);

      const currentEngineBrand = searchParams.get("engineBrand") ?? "";
      if (engineBrand !== currentEngineBrand) handleFilterChange("engineBrand", engineBrand);

      const currentAlternatorBrand = searchParams.get("alternatorBrand") ?? "";
      if (alternatorBrand !== currentAlternatorBrand) handleFilterChange("alternatorBrand", alternatorBrand);

      const currentMinPower = searchParams.get("minPower") ?? "";
      if (minPower !== currentMinPower) handleFilterChange("minPower", minPower);

      const currentMaxPower = searchParams.get("maxPower") ?? "";
      if (maxPower !== currentMaxPower) handleFilterChange("maxPower", maxPower);

      const currentVoltage = searchParams.get("voltage") ?? "";
      if (voltage !== currentVoltage) handleFilterChange("voltage", voltage);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchTerm,
    engineBrand,
    alternatorBrand,
    minPower,
    maxPower,
    voltage,
    searchParams,
    handleFilterChange,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={t("searchPlaceholder")}
          className="bg-card w-full pl-9 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
                {category.name}
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
            <SelectItem value="gasoline">{t("fuelOptions.gasoline")}</SelectItem>
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
