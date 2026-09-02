"use client";

import { useTranslations } from "next-intl";
import { Calculator, Save, RotateCcw, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Separator } from "@nhatnang/ui/components/ui/separator";
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
  const translate = t as unknown as (key: string, params?: Record<string, unknown>) => string;

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
    <Card className="shadow-sm border border-border sticky top-6">
      <CardHeader className="p-4 pb-3 border-b bg-muted/20">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          {translate("composer.summary.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-3 text-xs">
        {/* Total Items & Units */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{translate("composer.summary.totalItems")}</span>
          <span className="font-semibold text-foreground">
            {items.length} {translate("composer.summary.lineItemsUnit")} ({totalUnits}{" "}
            {translate("composer.summary.unitsCount")})
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {translate("composer.summary.subtotal")}
          </span>
          <span className="font-semibold text-foreground text-sm font-mono">
            {formatVND(subtotal)}
          </span>
        </div>

        {/* VAT Amount */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {translate("composer.summary.vat")} ({vatRate}%)
          </span>
          <span className="font-semibold text-foreground font-mono">
            {formatVND(vatAmount)}
          </span>
        </div>

        <Separator className="my-2" />

        {/* Grand Total */}
        <div className="flex items-baseline justify-between pt-1">
          <span className="font-bold text-sm text-foreground">
            {translate("composer.summary.grandTotal")}
          </span>
          <div className="text-right">
            <span className="font-bold text-lg text-primary font-mono block">
              {formatVND(grandTotal)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {translate("composer.summary.vatInclusiveNotice")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 border-t flex flex-col gap-2">
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
            if (window.confirm(translate("composer.summary.confirmResetDraft"))) {
              resetDraft();
            }
          }}
          className="w-full gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {translate("composer.summary.resetDraftButton")}
        </Button>
      </CardFooter>
    </Card>
  );
};
