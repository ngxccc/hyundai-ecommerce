"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@nhatnang/ui/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { priceFormatter } from "@nhatnang/shared/lib/utils";

interface CheckoutCashDepositBannerProps {
  orderId: string;
  orderTotal: number;
}

export function CheckoutCashDepositBanner({
  orderId,
  orderTotal,
}: CheckoutCashDepositBannerProps) {
  const t = useTranslations("Checkout");
  const te = useTranslations("errors");
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const handlePayDepositOnline = async () => {
    if (!orderId) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch("/api/payments/generate-deposit-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { checkoutUrl: string };
      };
      if (json.success && json.data?.checkoutUrl) {
        toast.success(t("redirectingToGateway"));
        window.location.assign(json.data.checkoutUrl);
      } else {
        toast.error(
          json.error ? te(json.error as never) : te("payosLinkCreationFailed"),
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(te("paymentGatewayConnectionFailed"));
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-3 rounded-sm border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h4 className="font-bold text-amber-900">{t("cashWarningTitle")}</h4>
          <p className="mt-1 text-xs leading-relaxed text-amber-700">
            {t.rich("cashWarningDesc", {
              amount: priceFormatter.format(orderTotal * 0.2),
              mono: (chunks: React.ReactNode) => (
                <span className="font-semibold text-amber-950">{chunks}</span>
              ),
            })}
          </p>
        </div>
      </div>
      <Button
        onClick={handlePayDepositOnline}
        disabled={isProcessingAction}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-600 py-5 text-xs font-bold tracking-wide text-white uppercase hover:bg-amber-700"
      >
        {isProcessingAction ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        {t("payDepositOnline")}
      </Button>
    </div>
  );
}
