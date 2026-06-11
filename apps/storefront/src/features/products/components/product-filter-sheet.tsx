"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@nhatnang/ui/components/ui/sheet";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Filter, X } from "lucide-react";
import type { TCategoryWithChildren } from "@nhatnang/database/services";
import type { TBrand } from "@nhatnang/database/schemas";
import { ProductFilters } from "./product-filters";

interface ProductFilterSheetProps {
  categories: TCategoryWithChildren[];
  brands: TBrand[];
  selectedCategorySlug?: string | undefined;
}

/**
 * Mobile Bottom Sheet wrapper for ProductFilters.
 * Renders the existing ProductFilters component inside a Sheet on mobile.
 * Desktop behavior is handled by the parent layout (sidebar).
 */
export function ProductFilterSheet({
  categories,
  brands,
  selectedCategorySlug,
}: ProductFilterSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Catalog.sidebar");
  const [open, setOpen] = useState(false);

  // Holds the accumulated filter state while the sheet is open.
  // This is only pushed to the URL when the user explicitly clicks "Apply".
  const [pendingParams, setPendingParams] = useState<URLSearchParams | null>(
    null,
  );

  const handlePendingChange = (params: URLSearchParams) => {
    setPendingParams(params);
  };

  const handleApply = () => {
    if (pendingParams) {
      const query = pendingParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
    setOpen(false);
    setPendingParams(null);
  };

  const handleClearAll = () => {
    setPendingParams(null);
    // When clearing filters, always navigate back to the main products list
    // instead of staying inside a specific category slug.
    router.push("/products", { scroll: false });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="sticky bottom-4 z-40 w-full shadow-lg lg:hidden"
        >
          <Filter className="mr-2 h-4 w-4" />
          {t("filters")}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="flex h-[85vh] flex-col p-0"
        showCloseButton={false}
      >
        <SheetHeader className="shrink-0 flex-row items-center justify-between border-b px-6 pt-4 pb-2">
          <SheetTitle className="text-lg font-bold tracking-tight">
            {t("filters")}
          </SheetTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs font-semibold"
          >
            {t("clear_all")}
            <X className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <ProductFilters
            categories={categories}
            brands={brands}
            selectedCategorySlug={selectedCategorySlug ?? ""}
            mode="sheet"
            onPendingFiltersChange={handlePendingChange}
            pendingSearchParams={pendingParams ?? undefined}
          />
        </div>
        {/* Sticky Footer */}
        <SheetFooter className="bg-background shrink-0 border-t p-6">
          <Button className="w-full" onClick={handleApply}>
            {t("apply")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
