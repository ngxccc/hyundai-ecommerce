import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import { OrderDetail } from "@/features/orders/components";
import { orderService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { type Locale } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminOrders" });

  return {
    title: `${t("orderDetailTitle")} #${id.slice(0, 8)}`,
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const tNav = await getTranslations("AdminDashboard.nav");
  const tHeader = await getTranslations("AdminOrders");

  const order = await orderService.getComplexOrder(id);
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
        <OrderDetail order={order} />
      </div>
    </>
  );
}
