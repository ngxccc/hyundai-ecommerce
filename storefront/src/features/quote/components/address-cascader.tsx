"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
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

export interface AddressState {
  city: string;
  district: string;
  streetAddress: string;
}

interface AddressCascaderProps {
  value: AddressState;
  onChange: (value: AddressState) => void;
  className?: string;
}

export function AddressCascader({
  value,
  onChange,
  className,
}: AddressCascaderProps) {
  const t = useTranslations("Quote");

  // Transform string arrays into standard ComboboxOption[]
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

  // cmdk custom filter for Vietnamese administrative locations
  const addressSearchFilter = useCallback(
    (itemValue: string, query: string): number => {
      const trimmed = query.trim();
      if (!trimmed) return 1;

      const normalizedQuery = removeVietnameseTones(trimmed);
      const normalizedValue = removeVietnameseTones(itemValue);
      const alias = VIETNAM_LOCATION_ALIASES[normalizedQuery] as
        string | undefined;

      const isMatch =
        normalizedValue.includes(normalizedQuery) ||
        (Boolean(alias) && normalizedValue.includes(alias!));

      return isMatch ? 1 : 0;
    },
    [],
  );

  const handleCityChange = (city: string) => {
    onChange({
      ...value,
      city,
      district: "", // reset subUnit when province changes
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
    <div className={className ?? "flex flex-col gap-3"}>
      {/* 2 Searchable Cascading Comboboxes: City / Province & Ward / Sub-unit */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-foreground/80 text-xs font-semibold">
            {t("city")}
          </label>
          <div className="mt-1">
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
        </div>

        <div>
          <label className="text-foreground/80 text-xs font-semibold">
            {t("district")}
          </label>
          <div className="mt-1">
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
      </div>

      {/* Street Address / Project Site */}
      <div>
        <label className="text-foreground/80 text-xs font-semibold">
          {t("streetAddress")}
        </label>
        <Input
          name="streetAddress"
          placeholder={t("streetAddressPlaceholder")}
          value={value.streetAddress}
          onChange={handleStreetAddressChange}
          className="mt-1"
        />
      </div>
    </div>
  );
}
