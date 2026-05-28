"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";

interface ProductPaginationProps {
  nextCursor?: string | undefined;
  prevCursor?: string | undefined;
}

export const ProductPagination = ({
  nextCursor,
  prevCursor,
}: ProductPaginationProps) => {
  // const t = useTranslations("AdminProducts.pagination");

  return (
    <div className="border-border/50 flex flex-col items-center justify-between gap-4 border-t pt-6">
      {/* We do not know total count with cursor pagination, so we can just show a simplified message */}
      {/* <p className="text-muted-foreground text-center text-sm sm:text-left">
        {t("showingCursor")}
      </p> */}

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={prevCursor ? `?before=${prevCursor}` : "#"}
              className={!prevCursor ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href={nextCursor ? `?after=${nextCursor}` : "#"}
              className={!nextCursor ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
