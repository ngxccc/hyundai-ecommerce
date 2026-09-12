import { InvoiceClient } from "@/features/orders/components";
import { ordersApi } from "@/features/orders/api/orders.api";
import { notFound } from "next/navigation";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminOrders" });

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

  const { data: res } = await ordersApi.getById(id);
  const order = res?.data;
  if (!order) {
    notFound();
  }

  return <InvoiceClient order={order} />;
}
