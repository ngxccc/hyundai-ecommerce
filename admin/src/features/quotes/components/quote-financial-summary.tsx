"use client";

import { useTranslations } from "next-intl";
import { Calculator, Save, RotateCcw, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuoteDraftStore } from "../stores/quote-draft.store";

export interface QuoteFinancialSummaryProps {
  isSubmitting?: boolean;
  onSubmitQuote: () => void;
}

export const QuoteFinancialSummary = ({
  isSubmitting = false,
  onSubmitQuote,
}: QuoteFinancialSummaryProps) => {
  const t = useTranslations("AdminQuotes");
  const translate = t as unknown as (
    key: string,
    params?: Record<string, unknown>,
  ) => string;

  const items = useQuoteDraftStore((state) => state.items);
  const vatRate = useQuoteDraftStore((state) => state.commercialTerms.vatRate);
  const resetDraft = useQuoteDraftStore((state) => state.resetDraft);

  // Compute metrics
  let subtotal = 0;
  let totalUnits = 0;

  for (const item of items) {
    const finalUnit = item.unitPrice * (1 - item.discountPercent / 100);
    subtotal += finalUnit * item.quantity;
    totalUnits += item.quantity;
  }

  const vatAmount = subtotal * (vatRate / 100);
  const grandTotal = subtotal + vatAmount;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  return (
    <Card className="border-border sticky top-6 border shadow-sm">
      <CardHeader className="bg-muted/20 border-b p-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Calculator className="text-primary h-4 w-4" />
          {translate("composer.summary.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-4 text-xs">
        {/* Total Items & Units */}
        <div className="text-muted-foreground flex items-center justify-between">
          <span>{translate("composer.summary.totalItems")}</span>
          <span className="text-foreground font-semibold">
            {items.length} {translate("composer.summary.lineItemsUnit")} (
            {totalUnits} {translate("composer.summary.unitsCount")})
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {translate("composer.summary.subtotal")}
          </span>
          <span className="text-foreground font-mono text-sm font-semibold">
            {formatVND(subtotal)}
          </span>
        </div>

        {/* VAT Amount */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {translate("composer.summary.vat")} ({vatRate}%)
          </span>
          <span className="text-foreground font-mono font-semibold">
            {formatVND(vatAmount)}
          </span>
        </div>

        <Separator className="my-2" />

        {/* Grand Total */}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-foreground text-sm font-bold">
            {translate("composer.summary.grandTotal")}
          </span>
          <div className="text-right">
            <span className="text-primary block font-mono text-lg font-bold">
              {formatVND(grandTotal)}
            </span>
            <span className="text-muted-foreground text-[10px]">
              {translate("composer.summary.vatInclusiveNotice")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t p-4 pt-2">
        <Button
          type="button"
          disabled={isSubmitting || items.length === 0}
          onClick={onSubmitQuote}
          className="w-full gap-2 font-semibold shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {translate("composer.summary.submitting")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {translate("composer.summary.submitButton")}
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSubmitting || items.length === 0}
          onClick={() => {
            if (
              window.confirm(translate("composer.summary.confirmResetDraft"))
            ) {
              resetDraft();
            }
          }}
          className="text-muted-foreground hover:text-destructive w-full gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {translate("composer.summary.resetDraftButton")}
        </Button>
      </CardFooter>
    </Card>
  );
};
