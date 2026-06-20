"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { regenerateOrderPaymentLinkAction } from "@/features/checkout/actions";
import { Loader2, XCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { priceFormatter } from "@nhatnang/shared/lib/utils";
import { useTranslations } from "next-intl";

interface CheckoutCancelViewProps {
  details: {
    type: "order" | "debt";
    amount: number;
    orderId?: string | undefined;
    userId?: string | undefined;
    orderCode: string;
  };
}

export function CheckoutCancelView({ details }: CheckoutCancelViewProps) {
  const t = useTranslations("Checkout");
  const te = useTranslations("errors");
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRetryPayment = async () => {
    if (!details.orderId) return;
    setIsProcessing(true);
    try {
      const res = await regenerateOrderPaymentLinkAction(details.orderId);
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
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md gap-0 rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <CardHeader className="text-center">
          <XCircle className="mx-auto mb-2 h-16 w-16 text-red-500" />
          <CardTitle className="text-2xl font-bold text-zinc-900">
            {t("paymentFailed")}
          </CardTitle>
          <p className="mt-1 text-sm text-zinc-500">{t("paymentFailedDesc")}</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4 rounded-xl border bg-zinc-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">{t("orderNumber")}:</span>
              <span className="font-mono font-semibold text-zinc-900">
                {details.orderCode}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-bold text-zinc-500">{t("total")}:</span>
              <span className="text-primary text-lg font-extrabold">
                {priceFormatter.format(details.amount)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {details.type === "order" && details.orderId && (
              <Button
                onClick={handleRetryPayment}
                disabled={isProcessing}
                className="bg-primary text-primary-foreground hover:bg-primary/95 flex w-full items-center justify-center gap-2 rounded-xl py-6 text-xs font-bold tracking-wider uppercase"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {t("retryPayment")}
              </Button>
            )}

            <Button
              onClick={() =>
                router.push(
                  details.type === "order" ? "/products" : "/portal/debt",
                )
              }
              disabled={isProcessing}
              variant="outline"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-zinc-200 py-6 text-xs font-bold tracking-wider text-zinc-700 uppercase"
            >
              <ShoppingBag className="h-4 w-4" />
              {details.type === "order"
                ? t("continueShopping")
                : t("backToDebt")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
