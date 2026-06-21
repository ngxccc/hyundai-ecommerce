"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Button } from "@nhatnang/ui/components/ui/button";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface OrderPaginationProps {
  type: "my" | "company";
  nextCursor?: string | undefined;
  prevCursor?: string | undefined;
  hasMore: boolean;
}

export function OrderPagination({
  type,
  nextCursor,
  prevCursor,
  hasMore,
}: OrderPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Catalog");
  const [, startTransition] = useTransition();

  const afterParam = type === "my" ? "after" : "companyAfter";
  const beforeParam = type === "my" ? "before" : "companyBefore";
  const lastParam = type === "my" ? "last" : "companyLast";

  const isGoingBack =
    searchParams.has(beforeParam) || searchParams.get(lastParam) === "true";

  const handleResetToFirstPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(afterParam);
    params.delete(beforeParam);
    params.delete(lastParam);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleGoToLastPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(afterParam);
    params.delete(beforeParam);
    params.set(lastParam, "true");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (direction: "prev" | "next") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(lastParam);

    if (direction === "next") {
      params.delete(beforeParam);
      if (nextCursor) {
        params.set(afterParam, nextCursor);
      }
    } else {
      params.delete(afterParam);
      if (prevCursor) {
        params.set(beforeParam, prevCursor);
      }
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const canGoPrev = isGoingBack ? hasMore : !!searchParams.get(afterParam);
  const canGoNext = isGoingBack ? !!searchParams.get(beforeParam) : hasMore;

  if (!nextCursor && !prevCursor) return null;

  return (
    <div className="flex items-center justify-center space-x-2.5 border-t bg-zinc-50/20 py-4">
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoPrev}
        onClick={handleResetToFirstPage}
        className="h-8 px-2 text-xs font-semibold hover:text-zinc-900 disabled:opacity-50 sm:px-3"
      >
        <ChevronsLeft className="h-3.5 w-3.5 sm:mr-1" />
        <span className="hidden sm:inline">{t("pagination.first")}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoPrev}
        onClick={() => handlePageChange("prev")}
        className="h-8 px-2 text-xs font-semibold disabled:opacity-50 sm:px-3"
      >
        <ChevronLeft className="h-3.5 w-3.5 sm:mr-1" />
        <span className="hidden sm:inline">{t("pagination.previous")}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoNext}
        onClick={() => handlePageChange("next")}
        className="h-8 px-2 text-xs font-semibold disabled:opacity-50 sm:px-3"
      >
        <span className="hidden sm:inline">{t("pagination.next")}</span>
        <ChevronRight className="h-3.5 w-3.5 sm:ml-1" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoNext}
        onClick={handleGoToLastPage}
        className="h-8 px-2 text-xs font-semibold hover:text-zinc-900 disabled:opacity-50 sm:px-3"
      >
        <span className="hidden sm:inline">{t("pagination.last")}</span>
        <ChevronsRight className="h-3.5 w-3.5 sm:ml-1" />
      </Button>
    </div>
  );
}
