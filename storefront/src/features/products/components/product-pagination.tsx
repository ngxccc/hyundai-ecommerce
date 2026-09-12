"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ProductPaginationProps {
  page?: number;
  totalPages?: number;
  hasMore?: boolean;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  /** Backward-compatible legacy props */
  nextCursor?: string | undefined;
  prevCursor?: string | undefined;
}

export function ProductPagination({
  page = 1,
  totalPages = 1,
  hasNextPage,
  hasPrevPage,
  hasMore = false,
  nextCursor,
  prevCursor,
}: ProductPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Catalog");
  const [, startTransition] = useTransition();

  const currentPage =
    page > 1
      ? page
      : Number(searchParams.get("page")) ||
        (searchParams.get("after") ? Number(searchParams.get("after")) : 1);

  const canGoPrev = hasPrevPage ?? currentPage > 1;
  const canGoNext =
    hasNextPage ?? (hasMore || (totalPages > 1 && currentPage < totalPages));

  const handlePageChange = (direction: "prev" | "next") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("after");
    params.delete("before");

    const targetPage =
      direction === "next" ? currentPage + 1 : Math.max(1, currentPage - 1);
    params.set("page", String(targetPage));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  if (
    !canGoPrev &&
    !canGoNext &&
    !nextCursor &&
    !prevCursor &&
    totalPages <= 1
  ) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-4 py-8">
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoPrev}
        onClick={() => {
          handlePageChange("prev");
        }}
        className="h-9 px-4 text-sm font-semibold"
      >
        <ChevronLeft className="mr-1.5 h-4 w-4" />
        {t("pagination.previous")}
      </Button>

      {totalPages > 1 && (
        <span className="text-muted-foreground text-xs font-medium">
          {currentPage} / {totalPages}
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={!canGoNext}
        onClick={() => {
          handlePageChange("next");
        }}
        className="h-9 px-4 text-sm font-semibold"
      >
        {t("pagination.next")}
        <ChevronRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}
