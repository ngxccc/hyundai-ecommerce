import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/routing";
import { redirect } from "next/navigation";
import { Button } from "@nhatnang/ui/components/ui/button";
import { getOrderSuccessDetailsAction } from "@/features/checkout/actions/payment.action";
import { XCircle } from "lucide-react";
import { CheckoutPayOSPendingView } from "@/features/checkout/components/checkout-payos-pending-view";

interface CheckoutPayPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function CheckoutPayPage({
  params,
  searchParams,
}: CheckoutPayPageProps) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("Checkout");
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.orderId;

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

  // If the order has already been paid, redirect to the success tracking page
  if (
    order.paymentStatus === "FULLY_PAID" ||
    order.paymentStatus === "DEPOSIT_PAID"
  ) {
    redirect(`/${locale}/checkout/success?orderId=${orderId}`);
  }

  // Fallback to success page if there's no pending PayOS transaction to show
  const isPending = !!transaction && transaction.status === "PENDING";

  if (!isPending) {
    redirect(`/${locale}/checkout/success?orderId=${orderId}`);
  }

  return (
    <CheckoutPayOSPendingView
      orderId={order.id}
      initialOrder={order}
      initialTransaction={transaction}
    />
  );
}
