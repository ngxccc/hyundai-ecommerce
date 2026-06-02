import { InvoiceClient } from "@/features/orders/components";
import { orderService } from "@nhatnang/database/services";
import { notFound } from "next/navigation";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminOrders" });

  return {
    title: `${t("invoiceTitle")} #${id.slice(0, 8).toUpperCase()}`,
  };
}

export default async function AdminInvoicePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  const order = await orderService.getComplexOrder(id);
  if (!order) {
    notFound();
  }

  return <InvoiceClient order={order} />;
}
