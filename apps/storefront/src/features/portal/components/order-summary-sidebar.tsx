"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SectionCard } from "./section-card";
import { Card, CardContent } from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Clock, Loader2, AlertTriangle, ClipboardList } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@nhatnang/ui/components/ui/alert-dialog";
import type { ComplexOrder } from "@nhatnang/database/services";
import { priceFormatter } from "@nhatnang/shared/lib/utils";
import { FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import { fetchApi } from "@nhatnang/shared/lib/api-client";
import { regenerateOrderPaymentLinkAction } from "@/features/checkout/actions";

interface OrderSummarySidebarProps {
  order: ComplexOrder;
  isPending: boolean;
  cooldown: number;
  onReVerifyPayment: () => Promise<void>;
  onCancelOrder: () => Promise<void>;
  variant?: "summary" | "actions" | "all";
}

export function OrderSummarySidebar({
  order,
  isPending,
  cooldown,
  onReVerifyPayment,
  onCancelOrder,
  variant = "all",
}: OrderSummarySidebarProps) {
  const t = useTranslations("Orders");
  const tc = useTranslations("Checkout");
  const te = useTranslations("errors");
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const handlePayDepositOnline = async () => {
    if (!order.id) return;
    setIsProcessingAction(true);
    try {
      const data = await fetchApi<{
        checkoutUrl: string;
      }>("/api/payments/generate-deposit-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (data?.checkoutUrl) {
        toast.success(tc("redirectingToGateway"));
        window.location.assign(data.checkoutUrl);
      } else {
        toast.error(te("payosLinkCreationFailed"));
      }
    } catch (err) {
      console.error(err);
      toast.error(te("paymentGatewayConnectionFailed"));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRegeneratePaymentLink = async () => {
    if (!order.id) return;
    setIsProcessingAction(true);
    try {
      const res = await regenerateOrderPaymentLinkAction(order.id);
      if (res.success && res.checkoutUrl) {
        toast.success(tc("redirectingToGateway"));
        window.location.assign(res.checkoutUrl);
      } else {
        toast.error(
          res.error ? te(res.error as never) : te("payosLinkCreationFailed"),
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(te("paymentGatewayConnectionFailed"));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
    0,
  );
  const vatAmount = itemsSubtotal * FINANCIAL_CONSTANTS.VAT_RATE;

  const showSummary = variant === "all" || variant === "summary";
  const showActions = variant === "all" || variant === "actions";

  return (
    <div className="space-y-6">
      {showSummary && (
        <SectionCard
          title={t("labels.orderSummaryLabel")}
          contentClassName="space-y-4 p-5 text-sm"
        >
        <div className="flex justify-between text-zinc-500">
          <span>{t("labels.summarySubtotal")}</span>
          <span className="font-medium text-zinc-900">
            {priceFormatter.format(itemsSubtotal)}
          </span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>{t("labels.summaryShippingFee")}</span>
          <span className="font-medium text-zinc-900">
            {priceFormatter.format(parseFloat(order.shippingFee ?? "0"))}
          </span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>VAT ({FINANCIAL_CONSTANTS.VAT_RATE * 100}%)</span>
          <span className="font-medium text-zinc-900">
            {priceFormatter.format(vatAmount)}
          </span>
        </div>
        <div className="my-2 flex justify-between border-t border-dashed pt-3 text-base font-bold text-zinc-900">
          <span>{t("labels.summaryTotal")}</span>
          <span>
            {priceFormatter.format(parseFloat(order.totalAmount ?? "0"))}
          </span>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">{t("labels.summaryMethod")}</span>
            <span className="font-bold text-zinc-700">
              {order.paymentMethod === "TRADE_CREDIT" &&
                t("labels.methodTradeCredit")}
              {order.paymentMethod === "PAYOS" && t("labels.methodVietQR")}
              {order.paymentMethod === "CASH" && t("labels.methodCash")}
            </span>
          </div>
        </div>
        </SectionCard>
      )}

      {showActions && (
        <>
      {/* PayOS pending or stuck verification widget */}
      {order.paymentMethod === "PAYOS" &&
        order.paymentStatus === "PENDING_VERIFICATION" && (
          <Card className="gap-0 border-amber-200 bg-amber-50/20 p-0">
            <CardContent className="space-y-4 p-5 text-center">
              <Clock className="mx-auto h-8 w-8 animate-pulse text-amber-500" />
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900">
                  {t("labels.paymentVerifyingTitle")}
                </h4>
                <p className="text-xs text-zinc-500">
                  {t("labels.paymentVerifyingDesc")}
                </p>
              </div>
              <Button
                onClick={onReVerifyPayment}
                disabled={isPending || cooldown > 0}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {cooldown > 0
                  ? t("labels.retryCooldown", { seconds: cooldown.toString() })
                  : t("labels.reVerifyPayment")}
              </Button>
            </CardContent>
          </Card>
        )}

      {/* PayOS unpaid QR redirect widget */}
      {order.paymentMethod === "PAYOS" &&
        order.paymentStatus === "UNPAID" &&
        order.status === "PENDING" && (
          <Card className="gap-0 border-blue-200 bg-blue-50/10 p-0">
            <CardContent className="space-y-3 p-5 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-blue-500" />
              <h4 className="font-bold text-zinc-900">
                {t("labels.orderUnpaidTitle")}
              </h4>
              <p className="text-xs leading-relaxed text-zinc-500">
                {t("labels.orderUnpaidDesc")}
              </p>
              <Button
                onClick={handleRegeneratePaymentLink}
                disabled={isProcessingAction}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessingAction && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("labels.payNow")}
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Cash Payment instructions */}
      {order.paymentMethod === "CASH" &&
        order.paymentStatus === "UNPAID" &&
        order.status === "PENDING" && (
          <Card className="gap-0 border-amber-200 bg-amber-50/20 p-0">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h4>{t("labels.depositRequiredTitle")}</h4>
              </div>
              <p className="text-xs leading-relaxed text-zinc-600">
                {t("labels.depositRequiredDesc", {
                  amount: priceFormatter.format(
                    parseFloat(order.totalAmount || "0") * 0.2,
                  ),
                })}
              </p>
              <Button
                onClick={handlePayDepositOnline}
                disabled={isProcessingAction}
                variant="outline"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {isProcessingAction && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("labels.payDepositVietQR")}
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Pay remaining amount for Trade Credit / Cash */}
      {order.paymentStatus === "DEPOSIT_PAID" &&
        (order.paymentMethod === "TRADE_CREDIT" ||
          order.paymentMethod === "CASH") &&
        order.status !== "CANCELLED" &&
        order.status !== "REFUNDED" &&
        order.status !== "DELIVERED" && (
          <Card className="gap-0 border-blue-200 bg-blue-50/10 p-0">
            <CardContent className="space-y-3 p-5 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-blue-500" />
              <h4 className="font-bold text-zinc-900">
                {t("labels.payRemainingTitle")}
              </h4>
              <p className="text-xs leading-relaxed text-zinc-500">
                {t("labels.payRemainingDesc", {
                  amount: priceFormatter.format(
                    parseFloat(order.totalAmount || "0") * 0.8,
                  ),
                })}
              </p>
              {order.paymentMethod === "TRADE_CREDIT" ? (
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Link
                    href={`/portal/debt?amount=${parseFloat(order.totalAmount || "0") * 0.8}`}
                  >
                    {t("labels.payRemainingDebt")}
                  </Link>
                </Button>
              ) : (
                <p className="text-xs font-semibold text-emerald-600">
                  {t("labels.payRemainingOnDelivery")}
                </p>
              )}
            </CardContent>
          </Card>
        )}

      {/* Cancellation Actions */}
      {(order.status === "PENDING" || order.status === "PROCESSING") &&
        (order.status === "PENDING" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                {t("labels.cancelOrder")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("labels.confirmCancelTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("labels.confirmCancelDesc")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("labels.backLabel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCancelOrder}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {t("labels.confirmCancelButton")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                {t("labels.requestCancellationButton")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("labels.requestCancelTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("labels.requestCancelDesc")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("labels.cancelLabel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCancelOrder}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {t("labels.confirmRequestButton")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </>
    )}
    </div>
  );
}
