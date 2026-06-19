"use client";

import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import { Card, CardContent } from "@nhatnang/ui/components/ui/card";
import { Separator } from "@nhatnang/ui/components/ui/separator";
import { Button } from "@nhatnang/ui/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { priceFormatter } from "@nhatnang/shared/lib/utils";
import type { CheckoutFormInput } from "./checkout-template";
import type { CartItem } from "@/features/cart";

interface CheckoutOrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  vat: number;
  totalAmount: number;
  depositAmount: number;
  isSubmitting: boolean;
  isPurchaser?: boolean;
}

export function CheckoutOrderSummary({
  cartItems,
  subtotal,
  vat,
  totalAmount,
  depositAmount,
  isSubmitting,
  isPurchaser = false,
}: CheckoutOrderSummaryProps) {
  const t = useTranslations("Checkout");
  const {
    control,
    formState: { errors },
  } = useFormContext<CheckoutFormInput>();

  const selectedPaymentMethod = useWatch({
    control,
    name: "paymentMethod",
  });
  const selectedPaymentOption = useWatch({
    control,
    name: "paymentOption",
  });

  return (
    <>
      {/* Desktop-only summary card */}
      <Card className="hidden lg:block gap-0 overflow-hidden rounded-xl border border-zinc-200 bg-white py-0 shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">
            {t("orderSummary")}
          </h2>
        </div>
        <CardContent className="space-y-6 px-6 py-4">
          {/* Product Items */}
          <div className="max-h-60 space-y-4 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="space-y-0.5">
                  <p className="line-clamp-2 font-semibold text-zinc-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {item.quantity} x {priceFormatter.format(Number(item.price))}
                  </p>
                </div>
                <span className="font-bold text-zinc-900">
                  {priceFormatter.format(Number(item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2 text-sm text-zinc-600">
            <div className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span className="font-semibold text-zinc-900">
                {priceFormatter.format(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("vat")}</span>
              <span className="font-semibold text-zinc-900">
                {priceFormatter.format(vat)}
              </span>
            </div>
            <div className="flex justify-between border-t border-dashed pt-2 text-base font-bold text-zinc-900">
              <span>{t("total")}</span>
              <span className="text-primary">
                {priceFormatter.format(totalAmount)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Amount Due Now */}
          <div className="space-y-1 rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              {t("amountDueNow")}
            </p>
            <p className="text-xl font-extrabold text-zinc-950">
              {selectedPaymentMethod === "TRADE_CREDIT"
                ? priceFormatter.format(0)
                : selectedPaymentOption === "DEPOSIT"
                  ? priceFormatter.format(depositAmount)
                  : priceFormatter.format(totalAmount)}
            </p>
            <p className="text-[10px] text-zinc-400">
              {selectedPaymentMethod === "TRADE_CREDIT"
                ? t("dueTradeCreditDesc")
                : selectedPaymentOption === "DEPOSIT"
                  ? selectedPaymentMethod === "CASH"
                    ? t("dueDepositCashDesc")
                    : t("dueDepositDesc")
                  : selectedPaymentMethod === "CASH"
                    ? t("dueFullCashDesc")
                    : t("dueFullDesc")}
            </p>
          </div>

          {/* Server Error Alert */}
          {errors.root && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/95 w-full rounded-xl py-3 text-sm font-bold tracking-wider uppercase"
          >
            {isSubmitting
              ? t("processing")
              : isPurchaser && selectedPaymentMethod === "TRADE_CREDIT"
                ? t("submitApproval")
                : t("placeOrder")}
          </Button>
        </CardContent>
      </Card>

      {/* Mobile-only sticky bottom layout */}
      <div className="fixed right-0 bottom-0 left-0 z-40 flex flex-col gap-2 border-t border-zinc-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
        {/* Server Error Alert */}
        {errors.root && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
              {t("amountDueNow")}
            </p>
            <p className="text-lg font-extrabold text-zinc-950">
              {selectedPaymentMethod === "TRADE_CREDIT"
                ? priceFormatter.format(0)
                : selectedPaymentOption === "DEPOSIT"
                  ? priceFormatter.format(depositAmount)
                  : priceFormatter.format(totalAmount)}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/95 max-w-50 flex-1 rounded-xl py-3 text-sm font-bold tracking-wider uppercase"
          >
            {isSubmitting
              ? t("processing")
              : isPurchaser && selectedPaymentMethod === "TRADE_CREDIT"
                ? t("submitApproval")
                : t("placeOrder")}
          </Button>
        </div>
      </div>
    </>
  );
}
