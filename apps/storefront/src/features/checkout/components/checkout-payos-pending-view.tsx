"use client";

import { useEffect, useState } from "react";
import { env } from "@/env";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  RefreshCw,
  Info,
  ArrowRight,
  XCircle,
} from "lucide-react";
import {
  priceFormatter,
  formatShippingAddress,
} from "@nhatnang/shared/lib/utils";
import {
  makePayOSDescription,
  payosAddInfo,
  kindFromTxType,
} from "@nhatnang/shared";
import {
  getOrderSuccessDetailsAction,
  reVerifyPaymentAction,
  cancelOrderPaymentLinkAction,
  type OrderSuccessDetails,
  type PaymentTransactionDetails,
} from "../actions";

interface CheckoutPayOSPendingViewProps {
  orderId: string;
  initialOrder: OrderSuccessDetails;
  initialTransaction: PaymentTransactionDetails;
}

export function CheckoutPayOSPendingView({
  orderId,
  initialOrder,
  initialTransaction,
}: CheckoutPayOSPendingViewProps) {
  const t = useTranslations("Checkout");
  const te = useTranslations("errors");
  const router = useRouter();
  const [order, setOrder] = useState<OrderSuccessDetails>(initialOrder);
  const [transaction, setTransaction] =
    useState<PaymentTransactionDetails | null>(initialTransaction);

  const orderCode = transaction?.orderCode ?? 0;
  const kind = kindFromTxType(transaction?.transactionType ?? "FULL");

  // Redirect to success page when payment is completed
  useEffect(() => {
    if (
      order.paymentStatus === "DEPOSIT_PAID" ||
      order.paymentStatus === "FULLY_PAID"
    ) {
      router.push(`/checkout/success?orderId=${orderId}`);
    }
  }, [order.paymentStatus, orderId, router]);

  // Timeouts and cooldown states
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!initialTransaction.createdAt) return 600;
    const createdAtTime = new Date(initialTransaction.createdAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - createdAtTime) / 1000);
    return Math.max(0, 600 - elapsedSeconds);
  });

  const [isTimeout, setIsTimeout] = useState(() => {
    if (!initialTransaction.createdAt) return false;
    const createdAtTime = new Date(initialTransaction.createdAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - createdAtTime) / 1000);
    return elapsedSeconds >= 600;
  });

  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [cooldown, setCooldown] = useState(() => {
    if (typeof window === "undefined" || !orderId) return 0;
    const lastVerify = localStorage.getItem(`lastVerify_${orderId}`);
    if (lastVerify) {
      const diff = Math.floor((Date.now() - parseInt(lastVerify, 10)) / 1000);
      if (diff < 30) {
        return 30 - diff;
      }
    }
    return 0;
  });

  // Cooldown countdown tick
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Polling logic for pending PAYOS payments
  useEffect(() => {
    if (isTimeout || !orderId || !order || !transaction) return;
    // Only poll if we have an online pending transaction
    if (
      order.paymentStatus === "FULLY_PAID" ||
      order.paymentStatus === "DEPOSIT_PAID"
    ) {
      return;
    }
    if (
      order.paymentMethod === "TRADE_CREDIT" ||
      transaction.status !== "PENDING"
    ) {
      return;
    }

    const pollInterval = setInterval(() => {
      const checkStatus = async () => {
        try {
          const res = await fetch(
            `/api/payments/verify-status?orderId=${orderId}`,
          );
          if (!res.ok) return;
          const data = (await res.json()) as {
            success: boolean;
            data?: { paymentStatus: string };
          };
          if (data.success && data.data) {
            const currentStatus = data.data.paymentStatus;
            if (
              currentStatus === "DEPOSIT_PAID" ||
              currentStatus === "FULLY_PAID"
            ) {
              toast.success(t("paymentSuccess"));
              clearInterval(pollInterval);
              setOrder((prev) => ({
                ...prev,
                paymentStatus: currentStatus,
              }));
              setTransaction((prev) =>
                prev ? { ...prev, status: "SUCCESS" } : null,
              );
            }
          }
        } catch (err) {
          console.error("Polling status error:", err);
        }
      };
      void checkStatus();
    }, 5000);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimeout(true);
          clearInterval(pollInterval);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timer);
    };
  }, [isTimeout, orderId, order, transaction, t]);

  const handleReVerify = async () => {
    if (!orderId) return;
    setIsProcessingAction(true);
    try {
      const res = await reVerifyPaymentAction(orderId);
      if (res.success) {
        toast.success(t("statusPolling"));
        localStorage.setItem(`lastVerify_${orderId}`, Date.now().toString());
        setCooldown(30);
        // Refresh details after verification
        const detailsRes = await getOrderSuccessDetailsAction(orderId);
        if (detailsRes.success && detailsRes.order) {
          setOrder(detailsRes.order);
          setTransaction(detailsRes.transaction ?? null);
        }
      } else {
        toast.error(res.error ?? te("paymentGatewayConnectionFailed"));
      }
    } catch (err) {
      console.error(err);
      toast.error(te("paymentGatewayConnectionFailed"));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!orderId) return;
    setIsProcessingAction(true);
    try {
      const res = await cancelOrderPaymentLinkAction(orderId, "Khách hàng hủy thanh toán trực tuyến");
      if (res.success) {
        toast.success(t("paymentCancelled"));
        router.push(`/checkout/cancel?orderCode=${res.orderCode}`);
      } else {
        toast.error(res.error ?? te("paymentGatewayConnectionFailed"));
      }
    } catch (err) {
      console.error(err);
      toast.error(te("paymentGatewayConnectionFailed"));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const isPayOSPending =
    !!transaction && transaction.status === "PENDING";

  return (
    <div className="flex items-center justify-center bg-zinc-50 p-4 py-4 md:py-6">
      <Card
        className={`w-full gap-0 overflow-hidden rounded-sm border border-zinc-200 bg-white py-0 shadow-sm transition-all duration-300 ${
          isPayOSPending ? "max-w-4xl" : "max-w-md"
        }`}
      >
        <CardHeader className="border-b bg-zinc-50/50 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-emerald-500" />
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            {t("paymentSuccess")}
          </CardTitle>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-zinc-500">
            {t("paymentSuccessDesc")}
          </p>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          {isPayOSPending && transaction ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              {/* Left Column: Details & Polling Status */}
              <div className="flex flex-col justify-between space-y-6 md:col-span-7">
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                      {t("paymentStatusLabel")}
                    </h3>
                    {isTimeout ? (
                      <div className="flex gap-2 rounded-sm border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
                        <Info className="h-5 w-5 shrink-0 text-blue-600" />
                        <p className="leading-relaxed font-medium">
                          {t("keepWaiting")}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-primary/5 text-primary border-primary/10 flex items-center justify-center gap-2 rounded-sm border py-3.5 text-xs font-semibold shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {t("statusPolling")} (
                          <span className="font-mono" suppressHydrationWarning>
                            {Math.floor(timeLeft / 60)}:
                            {String(timeLeft % 60).padStart(2, "0")}
                          </span>
                          )
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="space-y-4 rounded-sm border bg-zinc-50/50 p-5 text-sm">
                    <h3 className="mb-1 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                      {t("orderSummary")}
                    </h3>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t("orderNumber")}:</span>
                      <span className="font-mono font-semibold text-zinc-900">
                        {order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {order.shippingAddress && (
                      <div className="flex flex-col gap-1 border-t pt-3 text-left text-xs">
                        <span className="text-zinc-500">
                          {t("shippingAddress")}:
                        </span>
                        <span className="leading-relaxed font-medium text-zinc-700">
                          {formatShippingAddress(order.shippingAddress)}
                        </span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-2 border-t pt-3">
                      <span className="mb-1 block text-zinc-500">
                        {t("orderedProducts")}:
                      </span>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-4 text-xs"
                          >
                            <div className="max-w-40 md:max-w-50">
                              <span className="block leading-tight font-semibold text-zinc-900">
                                {item.productName}
                              </span>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="block text-zinc-600">
                                {item.quantity} x{" "}
                                {priceFormatter.format(item.unitPrice)}
                              </span>
                              <span className="block font-semibold text-zinc-900">
                                {priceFormatter.format(
                                  item.quantity * item.unitPrice,
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between border-t pt-3">
                      <span className="text-zinc-500">{t("shippingFee")}:</span>
                      <span className="font-semibold text-zinc-900">
                        {priceFormatter.format(order.shippingFee)}
                      </span>
                    </div>

                    <div className="flex justify-between border-t pt-3">
                      <span className="font-bold text-zinc-500">
                        {t("orderTotal")}:
                      </span>
                      <span className="text-primary text-lg font-extrabold">
                        {priceFormatter.format(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    asChild
                    className="flex w-full items-center justify-center gap-2 rounded-md py-6 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:shadow-lg"
                  >
                    <Link href="/portal/profile">
                      {t("goToPortal")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Column: VietQR Code & Bank Details */}
              <div className="space-y-6 border-zinc-100 md:col-span-5 md:border-l md:pl-8">
                <div className="flex flex-col items-center justify-center rounded-sm border border-zinc-100 bg-zinc-50 p-4">
                  <p className="mb-3 text-xs font-bold tracking-wide text-zinc-500 uppercase">
                    {t("scanToPay")}
                  </p>
                  <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-sm border border-zinc-200 bg-white p-2 shadow-sm">
                    <Image
                      src={`https://img.vietqr.io/image/${env.NEXT_PUBLIC_BANK_BIN}-${env.NEXT_PUBLIC_BANK_ACCOUNT_NO}-compact.png?amount=${transaction.amount}&addInfo=${payosAddInfo(kind, orderCode)}&accountName=${encodeURIComponent(env.NEXT_PUBLIC_BANK_ACCOUNT_NAME)}`}
                      alt="VietQR Scan Code"
                      width={256}
                      height={256}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                {/* Bank Details Table */}
                <div className="space-y-3 rounded-sm border bg-zinc-50 p-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t("bankName")}:</span>
                    <span className="font-semibold text-zinc-900">
                      {env.NEXT_PUBLIC_BANK_BIN.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-zinc-500">{t("accountNumber")}:</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {env.NEXT_PUBLIC_BANK_ACCOUNT_NO}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-zinc-500">{t("accountName")}:</span>
                    <span className="text-right font-semibold text-zinc-900">
                      {env.NEXT_PUBLIC_BANK_ACCOUNT_NAME}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-zinc-500">{t("amountToPay")}:</span>
                    <span className="text-primary font-bold">
                      {priceFormatter.format(transaction.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-zinc-500">
                      {t("paymentDescription")}:
                    </span>
                    <span className="text-end font-mono font-semibold text-zinc-900">
                      {makePayOSDescription(kind, orderCode)}
                    </span>
                  </div>
                </div>

                {/* Re-verify action button */}
                <div className="flex flex-col gap-2">
                  {/* Re-verify action button */}
                  <Button
                    onClick={handleReVerify}
                    disabled={isProcessingAction || cooldown > 0}
                    variant="outline"
                    className="flex w-full items-center justify-center gap-2 rounded-md py-5 text-xs font-bold tracking-wider uppercase transition-colors"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isProcessingAction ? "animate-spin" : ""}`}
                    />
                    {cooldown > 0
                      ? t("reverifyCooldown", { seconds: cooldown.toString() })
                      : t("reverifyPayment")}
                  </Button>

                  {/* Cancel Payment button */}
                  <Button
                    onClick={handleCancelPayment}
                    disabled={isProcessingAction}
                    variant="outline"
                    className="flex w-full items-center justify-center gap-2 rounded-md border-red-200 py-5 text-xs font-bold tracking-wider text-red-600 uppercase transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                    {t("cancelPayment")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Simple 1-column layout for CASH or TRADE_CREDIT or paid status */
            <div className="mx-auto max-w-md space-y-6 py-2">
              {/* Order Info */}
              <div className="space-y-4 rounded-sm border bg-zinc-50/50 p-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">{t("orderNumber")}:</span>
                  <span className="font-mono font-semibold text-zinc-900">
                    {order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                {order.shippingAddress && (
                  <div className="flex flex-col gap-1 border-t pt-3 text-left text-xs">
                    <span className="text-zinc-500">
                      {t("shippingAddress")}:
                    </span>
                    <span className="leading-relaxed font-medium text-zinc-700">
                      {formatShippingAddress(order.shippingAddress)}
                    </span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2 border-t pt-3">
                  <span className="mb-1 block text-zinc-500">
                    {t("orderedProducts")}:
                  </span>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 text-xs"
                      >
                        <div className="max-w-40 md:max-w-50">
                          <span className="block leading-tight font-semibold text-zinc-900">
                            {item.productName}
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="block text-zinc-600">
                            {item.quantity} x{" "}
                            {priceFormatter.format(item.unitPrice)}
                          </span>
                          <span className="block font-semibold text-zinc-900">
                            {priceFormatter.format(
                              item.quantity * item.unitPrice,
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="text-zinc-500">{t("shippingFee")}:</span>
                  <span className="font-semibold text-zinc-900">
                    {priceFormatter.format(order.shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="font-bold text-zinc-500">
                    {t("orderTotal")}:
                  </span>
                  <span className="text-primary text-lg font-extrabold">
                    {priceFormatter.format(order.totalAmount)}
                  </span>
                </div>
              </div>

              <Button
                asChild
                className="flex w-full items-center justify-center gap-2 rounded-md py-6 text-xs font-bold tracking-wider text-white uppercase shadow-sm"
              >
                <Link href="/portal/profile">
                  {t("goToPortal")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
