"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import type { CatalogSearchParams } from "../types/catalog";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { useIsClient } from "@/hooks/useIsClient";

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
    priceAsc: t("sort.priceAsc"),
    priceDesc: t("sort.priceDesc"),
  };
  const currentLabel = sortLabels[currentSort] ?? t("sort.newest");

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined && val !== "" && key !== "sort") {
        params.set(key, String(val));
      }
    });

    // Reset page cursors
    params.delete("after");
    params.delete("before");
    params.delete("page");

    if (value && value !== "newest") {
      params.set("sort", value);
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  if (!isClient) {
    return (
      <button
        disabled
        aria-label={t("sort.label")}
        className="border-input bg-background text-muted-foreground flex h-8.5 w-auto min-w-[145px] cursor-not-allowed items-center justify-between rounded-md border px-3 py-1.5 text-xs opacity-60 shadow-xs outline-hidden"
      >
        <div className="flex items-center gap-1.5 truncate">
          <ArrowUpDown className="size-3 shrink-0" />
          <span className="truncate">{currentLabel}</span>
        </div>
        <ChevronDown className="size-3 shrink-0 opacity-50" />
      </button>
    );
  }

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger
        className="h-8.5 w-auto min-w-[145px] gap-1.5 px-3 text-xs font-semibold"
        aria-label={t("sort.label")}
      >
        <ArrowUpDown className="text-muted-foreground size-3 shrink-0" />
        <SelectValue placeholder={t("sort.newest")} />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="newest" className="text-xs">
          {t("sort.newest")}
        </SelectItem>
        <SelectItem value="priceAsc" className="text-xs">
          {t("sort.priceAsc")}
        </SelectItem>
        <SelectItem value="priceDesc" className="text-xs">
          {t("sort.priceDesc")}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
