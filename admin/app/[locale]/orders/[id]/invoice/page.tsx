import { InvoiceClient } from "@/features/orders/components";
import { api } from "@/lib/api-client";
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

  const { data: res } = await api.GET("/orders/{id}", {
    params: { path: { id } },
  });
  const order = res?.data;
  if (!order) {
    notFound();
  }

  return <InvoiceClient order={order} />;
}
