import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { OrderList } from "@/features/orders/components";
import { ordersApi } from "@/features/orders/api/orders.api";
import { orderStatusEnum } from "@/shared/constants";
import type { AdminOrder, OrderStatus } from "@/types/api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminDashboard.nav" });

  return {
    title: t("orders"),
  };
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tNav = await getTranslations("adminDashboard.nav");
  const tHeader = await getTranslations("adminOrders");

  const resolvedSearchParams = await searchParams;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;
  const statusParam =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : undefined;

  // Validate status parameter with type guard
  const isOrderStatus = (val: string): val is OrderStatus =>
    (orderStatusEnum.enumValues as readonly string[]).includes(val);
  const status =
    statusParam && isOrderStatus(statusParam) ? statusParam : undefined;

  // Fetch filtered orders with backend SQL search
  const { data: ordersRes } = await ordersApi.list({
    status,
    search,
  });
  const orders: AdminOrder[] = ordersRes?.data ?? [];

  return (
    <>
      <BrandHeader
        title={tHeader("title")}
        description={tHeader("description")}
        showAddButton={false}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("orders") },
          ]}
        />
        <OrderList orders={orders} />
      </div>
    </>
  );
}
