"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { toast } from "sonner";
import { regenerateOrderPaymentLinkAction } from "../actions";
import { Loader2, RefreshCw, XCircle } from "lucide-react";
import { priceFormatter } from "@nhatnang/shared/lib/utils";

interface CheckoutPaymentFailedViewProps {
  orderId: string;
  orderTotal: number;
  paymentMethod: string;
  transactionOrderCode?: number | string | null;
}

export function CheckoutPaymentFailedView({
  orderId,
  orderTotal,
  paymentMethod,
  transactionOrderCode,
}: CheckoutPaymentFailedViewProps) {
  const t = useTranslations("Checkout");
  const te = useTranslations("errors");
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setIsProcessingAction(true);
    try {
      const res = await regenerateOrderPaymentLinkAction(orderId);
      if (res.success && res.checkoutUrl) {
        toast.success(t("redirectingToGateway"));
        window.location.assign(res.checkoutUrl);
      } else {
        toast.error(res.error ?? te("payosLinkCreationFailed"));
      }
    } catch (err) {
      console.error(err);
      toast.error(te("paymentGatewayConnectionFailed"));
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md gap-0 rounded-sm border border-zinc-200 bg-white shadow-sm">
        <CardHeader className="text-center">
          <XCircle className="mx-auto mb-2 h-16 w-16 text-red-500" />
          <CardTitle className="text-2xl font-bold text-zinc-900">
            {t("paymentFailed")}
          </CardTitle>
          <p className="mt-1 text-sm text-zinc-500">{t("paymentFailedDesc")}</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3 rounded-sm border bg-zinc-50 p-4 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">{t("orderNumber")}:</span>
              <span className="font-mono font-semibold text-zinc-900">
                {transactionOrderCode ?? orderId}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-zinc-500">{t("orderTotal")}:</span>
              <span className="font-semibold text-zinc-900">
                {priceFormatter.format(orderTotal)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-zinc-500">{t("paymentMethod")}:</span>
              <span className="font-semibold text-zinc-900">
                {paymentMethod === "PAYOS" ? "PayOS VietQR" : paymentMethod}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleRetryPayment}
              disabled={isProcessingAction}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 py-6 text-xs font-bold tracking-wider text-white uppercase hover:bg-zinc-800"
            >
              {isProcessingAction ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {t("retryPayment")}
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full rounded-md py-6 font-bold"
            >
              <Link href="/">{t("continueShopping")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
