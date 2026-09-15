"use client";

import { useTranslations } from "next-intl";
import { type QuoteItem } from "../hooks/use-quote";
import { ProductImage } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  priceFormatter,
  formatNumberInput,
  parseNumberInput,
} from "@/lib/utils";
import { Trash2, Plus, Minus, PackagePlus } from "lucide-react";

interface QuoteItemRowProps {
  item: QuoteItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateRequestedPrice: (id: string, requestedPrice: string | null) => void;
  onRemoveItem: (id: string) => void;
}

/**
 * Single line item in the B2B Quote Request items list.
 */
export function QuoteItemRow({
  item,
  onUpdateQuantity,
  onUpdateRequestedPrice,
  onRemoveItem,
}: QuoteItemRowProps) {
  const t = useTranslations("Quote");
  const itemId = item.id;
  const inputId = `req-price-${itemId}`;
  const itemPriceNum = Number(item.price);
  const hasPrice = itemPriceNum > 0;

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-6">
      <div className="flex items-start gap-4">
        {/* Thumbnail / Custom Icon */}
        <div className="border-border bg-muted/40 relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border sm:size-20">
          {item.isCustomItem ? (
            <PackagePlus className="text-primary size-7 opacity-80" />
          ) : (
            <ProductImage
              src={item.image}
              alt={item.name}
              fill
              sizes="80px"
              className="object-contain p-1"
              iconClassName="size-5"
            />
          )}
        </div>

        {/* Item Details */}
        <div className="flex grow flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-foreground text-sm font-semibold sm:text-base">
                {item.name}
              </h3>
              {item.isCustomItem && (
                <span className="bg-primary/10 text-primary mt-1 inline-block rounded-xs px-2 py-0.5 text-[11px] font-semibold">
                  {t("customBadge")}
                </span>
              )}
              {item.model && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Model:{" "}
                  <strong className="text-foreground">{item.model}</strong>
                </p>
              )}
              {item.specs && (
                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs italic">
                  {item.specs}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemoveItem(itemId)}
              title={t("deleteItem")}
              aria-label={t("deleteItem")}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {!item.isCustomItem && (
            <p className="text-muted-foreground mt-1 text-xs">
              {t("referencePriceLabel")}{" "}
              <span className="text-foreground font-medium">
                {hasPrice
                  ? priceFormatter.format(itemPriceNum)
                  : t("contactForPrice")}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Controls: Quantity & Requested Price */}
      <div className="border-border/60 mt-1 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {t("customItemQuantity")}:
          </span>
          <div className="border-border flex items-center rounded-md border">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:bg-muted size-7 rounded-none disabled:opacity-40"
              onClick={() => {
                onUpdateQuantity(itemId, Math.max(1, item.quantity - 1));
              }}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3" />
            </Button>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdateQuantity(itemId, isNaN(val) ? 1 : Math.max(1, val));
              }}
              className="text-foreground w-10 [appearance:textfield] bg-transparent text-center text-xs font-bold outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={t("customItemQuantity")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:bg-muted size-7 rounded-none"
              onClick={() => {
                onUpdateQuantity(itemId, item.quantity + 1);
              }}
              aria-label="Increase quantity"
            >
              <Plus className="size-3" />
            </Button>
          </div>
        </div>

        {/* Requested Price Input */}
        <div className="flex items-center gap-2">
          <label
            htmlFor={inputId}
            className="text-muted-foreground text-xs whitespace-nowrap select-none"
          >
            {t("requestedPriceLabel")}
          </label>
          <Input
            id={inputId}
            type="text"
            placeholder={
              hasPrice
                ? formatNumberInput(itemPriceNum)
                : t("requestedPricePlaceholder")
            }
            value={
              item.requestedPrice ? formatNumberInput(item.requestedPrice) : ""
            }
            onChange={(e) => {
              const digits = parseNumberInput(e.target.value);
              onUpdateRequestedPrice(itemId, digits ? digits : null);
            }}
            className="placeholder:text-muted-foreground/60 h-8 w-36 text-right text-xs sm:w-44"
          />
        </div>
      </div>
    </div>
  );
}
