import { Suspense } from "react";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { OrderDetail } from "@/features/orders/components";
import { getCachedSession } from "@/lib/session";
import { ordersApi } from "@/features/orders/api/orders.api";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { CenteredSpinner } from "@/components/common";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminOrders" });

  return {
    title: t("orderDetailTitle"),
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const tNav = await getTranslations("adminDashboard.nav");

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("orders"), href: "/orders" },
        ]}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <OrderDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function OrderDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const tHeader = await getTranslations("adminOrders");

  const [orderRes, session] = await Promise.all([
    ordersApi.getById(id),
    getCachedSession(),
  ]);
  const order = orderRes.data?.data;

  if (!order) {
    notFound();
  }

  const displayOrderCode = order.orderNumber;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {tHeader("orderDetailTitle")} {displayOrderCode}
        </h1>
        <p className="text-muted-foreground text-sm">
          {tHeader("orderDetailDescription")}
        </p>
      </div>

      <OrderDetail
        order={order}
        currentUser={
          session?.user
            ? {
                id: session.user.id,
                role: session.user.role,
                fullName: session.user.fullName,
              }
            : undefined
        }
      />
    </div>
  );
}
