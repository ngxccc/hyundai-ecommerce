"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nhatnang/ui/components/ui/select";
import { useTranslations } from "next-intl";
import type { CatalogSearchParams } from "../types/catalog";
import { ChevronDown } from "lucide-react";
import { useIsClient } from "@/shared/hooks/useIsClient";

interface ProductSortProps {
  currentSort: string;
  searchParams: CatalogSearchParams;
}

export function ProductSort({ currentSort, searchParams }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Catalog");
  const [, startTransition] = useTransition();

  const isClient = useIsClient();

  const sortLabels: Record<string, string> = {
    newest: t("sort.newest"),
    price_asc: t("sort.price_asc"),
    price_desc: t("sort.price_desc"),
  };
  const currentLabel = sortLabels[currentSort] ?? t("sort.newest");

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.set(key, String(val));
      }
    });

    // Reset page cursors
    params.delete("after");
    params.delete("before");

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  if (!isClient) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">
          {t("sort.label")}:
        </span>
        <button
          disabled
          className="border-input bg-background text-muted-foreground flex h-9 w-45 cursor-not-allowed items-center justify-between rounded-md border px-3 py-2 text-sm opacity-60 shadow-xs outline-hidden"
        >
          <span className="line-clamp-1">{currentLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">
        {t("sort.label")}:
      </span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="h-9 w-45">
          <SelectValue placeholder={t("sort.newest")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t("sort.newest")}</SelectItem>
          <SelectItem value="price_asc">{t("sort.price_asc")}</SelectItem>
          <SelectItem value="price_desc">{t("sort.price_desc")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
