"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Button } from "@nhatnang/ui/components/ui/button";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  nextCursor?: string | undefined;
  prevCursor?: string | undefined;
  hasMore: boolean;
}

export function ProductPagination({
  nextCursor,
  prevCursor,
  hasMore,
}: ProductPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Catalog");
  const [, startTransition] = useTransition();

  const isGoingBack = searchParams.has("before");

  const handlePageChange = (direction: "prev" | "next") => {
    const params = new URLSearchParams(searchParams.toString());

    if (direction === "next") {
      params.delete("before");
      if (nextCursor) {
        params.set("after", nextCursor);
      }
    } else {
      params.delete("after");
      if (prevCursor) {
        params.set("before", prevCursor);
      }
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const canGoPrev = isGoingBack ? hasMore : !!searchParams.get("after");
  const canGoNext = isGoingBack ? !!searchParams.get("before") : hasMore;

  if (!nextCursor && !prevCursor) return null;

  return (
    <div className="flex items-center justify-center space-x-4 py-8">
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoPrev}
        onClick={() => handlePageChange("prev")}
        className="h-9 px-4 text-sm font-semibold"
      >
        <ChevronLeft className="mr-1.5 h-4 w-4" />
        {t("pagination.previous")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoNext}
        onClick={() => handlePageChange("next")}
        className="h-9 px-4 text-sm font-semibold"
      >
        {t("pagination.next")}
        <ChevronRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}
