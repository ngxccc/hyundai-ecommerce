"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";

export const ProductFilters = () => {
  const t = useTranslations("AdminProducts.filters");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {/* Category Filter */}
      <Select defaultValue="all">
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allCategories")}</SelectItem>
          <SelectItem value="generator">Máy phát điện</SelectItem>
          <SelectItem value="ups">Trạm sạc dự phòng</SelectItem>
          <SelectItem value="industrial">Máy công nghiệp</SelectItem>
        </SelectContent>
      </Select>

      {/* Brand Filter */}
      <Select defaultValue="all">
        <SelectTrigger className="bg-card w-full shadow-sm">
          <SelectValue placeholder={t("allBrands")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allBrands")}</SelectItem>
          <SelectItem value="hyundai">Hyundai</SelectItem>
          <SelectItem value="mitsubishi">Mitsubishi</SelectItem>
          <SelectItem value="perkins">Perkins</SelectItem>
        </SelectContent>
      </Select>

      {/* Fuel Type Filter */}
      <Select defaultValue="all">
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
      <Select defaultValue="all">
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
      <Select defaultValue="all">
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

      {/* Quote Only Toggle */}
      <div className="border-border bg-card flex w-full items-center space-x-2 rounded-md border px-4 py-2 shadow-sm">
        <Checkbox id="quote-only" />
        <label
          htmlFor="quote-only"
          className="text-muted-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t("quoteOnly")}
        </label>
      </div>
    </div>
  );
};
