"use client";

import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/routing";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface OffsetPaginationProps {
  page?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  total?: number;
  label?: string;
}

export const OffsetPagination = ({
  page = 1,
  totalPages = 1,
  hasNextPage,
  hasPrevPage,
  total,
  label = "mục",
}: OffsetPaginationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const canGoPrev = hasPrevPage ?? page > 1;
  const canGoNext = hasNextPage ?? page < totalPages;

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1 && (!total || total <= 0)) {
    return null;
  }

  return (
    <div className="border-border/50 flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
      {total != null && (
        <p className="text-muted-foreground text-center text-xs sm:text-left">
          Trang {page} / {totalPages} (Tổng cộng {total} {label})
        </p>
      )}

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              asChild
              className={!canGoPrev ? "pointer-events-none opacity-50" : ""}
            >
              <Link
                href={canGoPrev ? createPageUrl(page - 1) : "#"}
                scroll={false}
              />
            </PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <span className="text-muted-foreground px-3 text-xs font-medium">
              {page} / {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              asChild
              className={!canGoNext ? "pointer-events-none opacity-50" : ""}
            >
              <Link
                href={canGoNext ? createPageUrl(page + 1) : "#"}
                scroll={false}
              />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
