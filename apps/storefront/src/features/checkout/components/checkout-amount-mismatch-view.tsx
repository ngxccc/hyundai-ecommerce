"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { AlertTriangle, ShoppingBag } from "lucide-react";
import { priceFormatter } from "@nhatnang/shared/lib/utils";

interface CheckoutAmountMismatchViewProps {
  orderId: string;
  orderTotal: number;
  transactionOrderCode?: number | string | null;
}

export function CheckoutAmountMismatchView({
  orderId,
  orderTotal,
  transactionOrderCode,
}: CheckoutAmountMismatchViewProps) {
  const t = useTranslations("Checkout");

  return (
    <div className="flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md gap-0 rounded-sm border border-zinc-200 bg-white shadow-sm">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto mb-2 h-16 w-16 animate-pulse text-amber-500" />
          <CardTitle className="text-2xl font-bold text-zinc-900">
            {t("amountMismatchTitle")}
          </CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            {t("amountMismatchDesc")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs leading-relaxed font-medium text-amber-800">
              {t("amountMismatchHoldAlert")}
            </p>
          </div>

          <div className="space-y-4 rounded-xl border bg-zinc-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">{t("orderNumber")}:</span>
              <span className="font-mono font-semibold text-zinc-900">
                {transactionOrderCode ?? orderId}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-bold text-zinc-500">{t("total")}:</span>
              <span className="text-primary text-lg font-extrabold">
                {priceFormatter.format(orderTotal)}
              </span>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-zinc-200 py-6 text-xs font-bold tracking-wider text-zinc-700 uppercase"
          >
            <Link href="/products">
              <ShoppingBag className="h-4 w-4" />
              {t("continueShopping")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
