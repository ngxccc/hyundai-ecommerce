"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { CustomQuoteItemModal } from "./custom-quote-item-modal";

/**
 * Rendered when the customer has not selected any items for quotation.
 */
export function QuoteEmptyState() {
  const t = useTranslations("Quote");

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
        <FileText className="size-7" />
      </div>
      <h2 className="text-foreground text-xl font-bold">{t("emptyTitle")}</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {t("emptyDescription")}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <Button asChild size="lg">
          <Link href="/products">{t("exploreProducts")}</Link>
        </Button>
        <div className="w-full sm:w-auto">
          <CustomQuoteItemModal />
        </div>
      </div>
    </div>
  );
}
