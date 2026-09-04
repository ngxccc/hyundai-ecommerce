"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface DataTableSearchInputProps {
  placeholder?: string;
  paramKey?: string;
  debounceMs?: number;
  className?: string;
}

export const DataTableSearchInput = ({
  placeholder = "Search...",
  paramKey = "search",
  debounceMs = 500,
  className,
}: DataTableSearchInputProps) => {
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
    searchParams.get(paramKey) ?? "",
  );
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  useEffect(() => {
    const currentSearch = searchParams.get(paramKey) ?? "";
    if (debouncedSearchTerm !== currentSearch) {
      handleFilterChange(paramKey, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleFilterChange, searchParams, paramKey]);

  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};
