"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nhatnang/ui/components/ui/select";
import { useTranslations } from "next-intl";

export function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Catalog");
  const [, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") ?? "newest";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

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
