"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@nhatnang/ui/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Search } from "lucide-react";

export const CategoryFilters = () => {
  const t = useTranslations("AdminCategories.header");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearchTerm !== currentSearch) {
      handleFilterChange("search", debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleFilterChange, searchParams]);

  return (
    <div className="relative flex-1">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder={t("searchPlaceholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};
