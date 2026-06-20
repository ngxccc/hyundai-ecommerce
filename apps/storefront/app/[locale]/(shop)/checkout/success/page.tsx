import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { Link, redirect } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { getOrderSuccessDetailsAction } from "@/features/checkout/actions/payment.action";
import { CheckCircle2, ArrowRight, XCircle } from "lucide-react";
import {
  priceFormatter,
  formatShippingAddress,
} from "@nhatnang/shared/lib/utils";
import { CheckoutPaymentFailedView } from "@/features/checkout/components/checkout-payment-failed-view";
import { CheckoutAmountMismatchView } from "@/features/checkout/components/checkout-amount-mismatch-view";
import { CheckoutCashDepositBanner } from "@/features/checkout/components/checkout-cash-deposit-banner";
import { CheckoutProgressTracker } from "@/features/checkout/components/checkout-progress-tracker";

interface CheckoutSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    orderId?: string;
    status?: string;
    cancel?: string;
  }>;
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: CheckoutSuccessPageProps) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("Checkout");
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.orderId;
  const statusParam = resolvedSearchParams.status;
  const cancelParam = resolvedSearchParams.cancel;

  if (!orderId) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-zinc-900">
          {t("errorLoadingPayment")}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">{t("missingOrderCode")}</p>
        <Button asChild className="mt-6 w-full rounded-md py-6 font-bold">
          <Link href="/">{t("backToHome")}</Link>
        </Button>
      </div>
    );
  }

  const res = await getOrderSuccessDetailsAction(orderId);

  if (!res.success || !res.order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-zinc-900">
          {t("errorLoadingPayment")}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {res.error ?? t("invalidTransaction")}
        </p>
        <Button asChild className="mt-6 w-full rounded-md py-6 font-bold">
          <Link href="/">{t("backToHome")}</Link>
        </Button>
      </div>
    );
  }

  const { order, transaction } = res;

  const isAmountMismatch = order.status === "SUSPICIOUS_PAYMENT_HOLD";

  if (isAmountMismatch) {
    return (
      <CheckoutAmountMismatchView
        orderId={order.id}
        orderTotal={order.totalAmount}
        transactionOrderCode={transaction?.orderCode ?? null}
      />
    );
  }

  const isPaymentFailed =
    order.paymentStatus === "UNPAID" &&
    (statusParam === "FAILED" ||
      statusParam === "CANCELLED" ||
      cancelParam === "true" ||
      transaction?.status === "FAILED");

  if (isPaymentFailed) {
    return (
      <CheckoutPaymentFailedView
        orderId={order.id}
        orderTotal={order.totalAmount}
        paymentMethod={order.paymentMethod}
        transactionOrderCode={transaction?.orderCode ?? null}
      />
    );
  }

  const isPayOSPending =
    order.paymentMethod === "PAYOS" && transaction?.status === "PENDING";

  const isDepositPending = !!transaction && transaction.status === "PENDING";

  if (isPayOSPending || isDepositPending) {
    redirect({
      href: `/checkout/pay?orderId=${orderId}`,
      locale,
    });
    return null;
  }

  return (
    <div className="flex items-center justify-center bg-zinc-50 p-4 md:py-6">
      <Card className="w-full max-w-md gap-0 overflow-hidden rounded-sm border border-zinc-200 bg-white py-0 shadow-sm md:max-w-4xl">
        <CardHeader className="border-b bg-zinc-50/50 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-emerald-500" />
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            {t("paymentSuccess")}
          </CardTitle>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-zinc-500">
            {t("paymentSuccessDesc")}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Left Column: Details & Warnings */}
            <div className="flex flex-col justify-between space-y-6 md:col-span-7">
              <div className="space-y-6">
                {order.paymentMethod === "CASH" &&
                  order.paymentStatus === "UNPAID" && (
                    <CheckoutCashDepositBanner
                      orderId={order.id}
                      orderTotal={order.totalAmount}
                    />
                  )}

                {/* Order Info */}
                <div className="space-y-4 rounded-sm border bg-zinc-50/50 p-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t("orderNumber")}:</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  {order.shippingAddress && (
                    <div className="flex flex-col gap-1 border-t pt-3 text-xs">
                      <span className="text-zinc-500">
                        {t("shippingAddress")}:
                      </span>
                      <span className="text-left leading-relaxed font-medium text-zinc-700">
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
                          <div className="max-w-45 md:max-w-55">
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
                  className="flex w-full items-center justify-center gap-2 rounded-md py-6 text-xs font-bold tracking-wider text-white uppercase shadow-sm"
                >
                  <Link href="/portal/profile">
                    {t("goToPortal")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: B2B Delivery Progress Tracker */}
            <div className="border-zinc-100 md:col-span-5 md:border-l md:pl-8">
              <CheckoutProgressTracker isB2B={res.isB2B ?? false} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
