import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@nhatnang/ui/components/ui/button";
import { getPaymentDetailsByOrderCodeAction } from "@/features/checkout/actions/payment.action";
import { XCircle } from "lucide-react";
import { CheckoutCancelView } from "@/features/checkout/components/checkout-cancel-view";

interface CheckoutCancelPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    orderCode?: string;
  }>;
}

export default async function CheckoutCancelPage({
  params,
  searchParams,
}: CheckoutCancelPageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("Checkout");
  const resolvedSearchParams = await searchParams;
  const orderCode = resolvedSearchParams.orderCode;

  if (!orderCode) {
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

  const res = await getPaymentDetailsByOrderCodeAction(orderCode);

  if (!res.success || !res.orderCode) {
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

  const details = {
    type: res.type,
    amount: res.amount,
    orderId: res.orderId,
    userId: res.userId,
    orderCode: res.orderCode,
  };

  return <CheckoutCancelView details={details} />;
}
