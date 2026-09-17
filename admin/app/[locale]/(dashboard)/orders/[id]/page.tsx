import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { OrderDetail } from "@/features/orders/components";
import { getCachedSession } from "@/lib/session";
import { ordersApi } from "@/features/orders/api/orders.api";
import type { Locale } from "next-intl";
import type { UserRole } from "@/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";
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
    title: `${t("orderDetailTitle")} #${id.slice(0, 8)}`,
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await connection();
  const { id } = await params;
  const tNav = await getTranslations("adminDashboard.nav");
  const tHeader = await getTranslations("adminOrders");

  const [orderRes, session] = await Promise.all([
    ordersApi.getById(id),
    getCachedSession(),
  ]);
  const order = orderRes.data?.data;

  if (!order) {
    notFound();
  }

  return (
    <>
      <BrandHeader
        title={`${tHeader("orderDetailTitle")} #${id.slice(0, 8)}`}
        description={tHeader("orderDetailDescription")}
        showAddButton={false}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("orders"), href: "/orders" },
            { label: `#${id.slice(0, 8)}` },
          ]}
        />
        <OrderDetail
          order={order}
          currentUser={
            session?.user
              ? {
                  id: session.user.id,
                  role: session.user.role as UserRole,
                  name: session.user.fullName,
                }
              : undefined
          }
        />
      </div>
    </>
  );
}
