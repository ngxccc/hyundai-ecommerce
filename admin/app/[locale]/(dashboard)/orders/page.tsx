import { Suspense } from "react";
import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { OrderList } from "@/features/orders/components";
import { ordersApi } from "@/features/orders/api/orders.api";
import { OffsetPagination } from "@/components/common/offset-pagination";
import { orderStatusEnum } from "@/constants";
import type { AdminOrder, OrderStatus } from "@/types/api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { connection } from "next/server";
import type { Metadata } from "next";
import { CenteredSpinner } from "@/components/common";

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
  const [tNav, tHeader] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminOrders"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("orders") },
        ]}
      />

      <BrandHeader
        title={tHeader("title")}
        description={tHeader("description")}
        showAddButton={false}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrdersContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const resolvedSearchParams = await searchParams;
  const page =
    typeof resolvedSearchParams.page === "string"
      ? Number(resolvedSearchParams.page) || 1
      : 1;
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

  // Fetch filtered orders with backend SQL search and offset pagination
  const { data: ordersRes } = await ordersApi.list({
    page,
    limit: 20,
    status,
    search,
  });
  const orders: AdminOrder[] = ordersRes?.data ?? [];
  const meta = ordersRes?.meta;

  return (
    <div className="flex w-full flex-col gap-4">
      <OrderList orders={orders} />
      <OffsetPagination
        page={meta?.page ?? page}
        totalPages={meta?.totalPages ?? 1}
        total={meta?.total}
        hasNextPage={meta?.hasNextPage}
        hasPrevPage={meta?.hasPrevPage}
        label="đơn hàng"
      />
    </div>
  );
}
