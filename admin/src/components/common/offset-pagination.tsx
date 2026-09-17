"use client";

import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "cn";
import { useTranslations } from "next-intl";

export interface OffsetPaginationProps {
  page?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  total?: number;
  label?: string;
  limitOptions?: number[];
}

export const OffsetPagination = ({
  page = 1,
  totalPages = 1,
  hasNextPage,
  hasPrevPage,
  total,
  label = "mục",
  limitOptions = [10, 20, 50, 100],
}: OffsetPaginationProps) => {
  const t = useTranslations("pagination");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentLimit = Number(searchParams.get("limit")) || 20;

  const canGoPrev = hasPrevPage ?? page > 1;
  const canGoNext = hasNextPage ?? page < totalPages;

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `${pathname}?${params.toString()}`;
  };

  const handleLimitChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1 && (!total || total <= 0)) {
    return null;
  }

  // Compact page numbers without redundant single-item ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="border-border/50 flex flex-col items-center justify-center gap-4 border-t pt-5 pb-8">
      {/* Centered Numbered Pagination */}
      <Pagination className="mx-auto w-auto">
        <PaginationContent className="flex-wrap items-center justify-center gap-1">
          {/* Previous Page Button */}
          <PaginationItem>
            <PaginationPrevious
              asChild
              className={cn(
                "h-9",
                !canGoPrev && "pointer-events-none opacity-40",
              )}
            >
              <Link
                href={canGoPrev ? createPageUrl(page - 1) : "#"}
                scroll={false}
              >
                {t("previous")}
              </Link>
            </PaginationPrevious>
          </PaginationItem>

          {/* Numbered Page Buttons (1, 2, 3...) */}
          {pageNumbers.map((item, index) => {
            if (typeof item !== "number") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            const isCurrent = item === page;
            return (
              <PaginationItem key={item}>
                <PaginationLink asChild isActive={isCurrent} className="size-9">
                  <Link
                    href={createPageUrl(item)}
                    scroll={false}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {item}
                  </Link>
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next Page Button */}
          <PaginationItem>
            <PaginationNext
              asChild
              className={cn(
                "h-9",
                !canGoNext && "pointer-events-none opacity-40",
              )}
            >
              <Link
                href={canGoNext ? createPageUrl(page + 1) : "#"}
                scroll={false}
              >
                {t("next")}
              </Link>
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Centered Summary and Rows-Per-Page Select */}
      <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-3 text-xs">
        {total != null && (
          <span>{t("totalCount", { total: String(total), label })}</span>
        )}

        {total != null && <span className="text-border">•</span>}

        <div className="flex items-center gap-1.5">
          <span>{t("rowsPerPage")}:</span>
          <Select
            value={String(currentLimit)}
            onValueChange={handleLimitChange}
          >
            <SelectTrigger size="sm" className="h-7 w-fit text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)} className="text-xs">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
