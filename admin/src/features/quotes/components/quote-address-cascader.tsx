"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getProvinceNames,
  getSubUnitsByProvinceName,
  removeVietnameseTones,
} from "@/data/vietnam-provinces";

const VIETNAM_LOCATION_ALIASES: Record<string, string> = {
  hcm: "ho chi minh",
  "tp.hcm": "ho chi minh",
  tphcm: "ho chi minh",
  hn: "ha noi",
  "tp.hn": "ha noi",
  tphn: "ha noi",
  dn: "da nang",
  hp: "hai phong",
  ct: "can tho",
  bd: "binh duong",
  dnai: "dong nai",
};

export interface QuoteAddressState {
  city: string;
  district: string;
  streetAddress: string;
}

interface QuoteAddressCascaderProps {
  value: QuoteAddressState;
  onChange: (value: QuoteAddressState) => void;
  className?: string;
}

export function QuoteAddressCascader({
  value,
  onChange,
  className,
}: QuoteAddressCascaderProps) {
  const t = useTranslations("adminQuotes.composer.address");

  const provinceOptions = useMemo<ComboboxOption[]>(() => {
    return getProvinceNames().map((name) => ({
      value: name,
      label: name,
    }));
  }, []);

  const subUnitOptions = useMemo<ComboboxOption[]>(() => {
    if (!value.city) return [];
    return getSubUnitsByProvinceName(value.city).map((name) => ({
      value: name,
      label: name,
    }));
  }, [value.city]);

  const addressSearchFilter = useCallback(
    (itemValue: string, query: string): number => {
      const trimmed = query.trim();
      if (!trimmed) return 1;

      const normalizedQuery = removeVietnameseTones(trimmed);
      const normalizedValue = removeVietnameseTones(itemValue);
      const alias = VIETNAM_LOCATION_ALIASES[normalizedQuery];

      const isMatch =
        normalizedValue.includes(normalizedQuery) ||
        (Boolean(alias) && normalizedValue.includes(alias));

      return isMatch ? 1 : 0;
    },
    [],
  );

  const handleCityChange = (city: string) => {
    onChange({
      ...value,
      city,
      district: "",
    });
  };

  const handleDistrictChange = (district: string) => {
    onChange({
      ...value,
      district,
    });
  };

  const handleStreetAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onChange({
      ...value,
      streetAddress: e.target.value,
    });
  };

  return (
    <div
      className={className ?? "col-span-full flex flex-col gap-4 md:col-span-2"}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">{t("city")}</Label>
          <Combobox
            options={provinceOptions}
            value={value.city}
            onChange={handleCityChange}
            filter={addressSearchFilter}
            placeholder={t("cityPlaceholder")}
            searchPlaceholder={t("searchPlaceholder")}
            emptyText={t("emptySearch")}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">{t("district")}</Label>
          <Combobox
            options={subUnitOptions}
            value={value.district}
            onChange={handleDistrictChange}
            filter={addressSearchFilter}
            disabled={!value.city}
            placeholder={
              value.city ? t("districtPlaceholder") : t("selectCityFirst")
            }
            searchPlaceholder={t("searchPlaceholder")}
            emptyText={t("emptySearch")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="streetAddress" className="text-xs font-semibold">
          {t("streetAddress")}
        </Label>
        <Input
          id="streetAddress"
          value={value.streetAddress}
          onChange={handleStreetAddressChange}
          placeholder={t("streetAddressPlaceholder")}
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
}
