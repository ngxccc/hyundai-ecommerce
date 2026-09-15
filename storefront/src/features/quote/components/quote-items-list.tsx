"use client";

import { useTranslations } from "next-intl";
import { type QuoteItem } from "../hooks/use-quote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteItemRow } from "./quote-item-row";
import { CustomQuoteItemModal } from "./custom-quote-item-modal";

interface QuoteItemsListProps {
  items: QuoteItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateRequestedPrice: (id: string, requestedPrice: string | null) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

/**
 * Left-column container displaying selected quote items and custom item modal trigger.
 */
export function QuoteItemsList({
  items,
  onUpdateQuantity,
  onUpdateRequestedPrice,
  onRemoveItem,
  onClearAll,
}: QuoteItemsListProps) {
  const t = useTranslations("Quote");

  return (
    <div className="lg:col-span-7">
      <Card size="dense">
        <CardHeader bordered size="dense" className="py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">
              {t("selectedProducts")} ({items.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
              onClick={onClearAll}
            >
              {t("clearAll")}
            </Button>
          </div>
        </CardHeader>
        <CardContent size="compact" className="divide-border/60 divide-y">
          {items.map((item) => (
            <QuoteItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onUpdateRequestedPrice={onUpdateRequestedPrice}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </CardContent>
      </Card>

      {/* Trigger for adding non-catalog items */}
      <div className="mt-4">
        <CustomQuoteItemModal />
      </div>
    </div>
  );
}
