"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export const ProductPagination = () => {
  const t = useTranslations("AdminProducts.pagination");

  return (
    <div className="border-border/50 flex flex-col items-center gap-4 border-t pt-6 sm:flex-row sm:justify-between">
      <p className="text-muted-foreground text-center text-sm sm:text-left">
        {t("showing", { start: "1", end: "4", total: "124" })}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 disabled:opacity-50"
          disabled
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="default" size="icon" className="h-8 w-8 text-sm">
          1
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 text-sm">
          2
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 text-sm">
          3
        </Button>
        <span className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm">
          ...
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
