import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { OrderList } from "@/features/orders/components";
import {
  adminApiClient,
  orderStatusEnum,
  type AdminOrder,
} from "@/lib/api-client";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminDashboard.nav" });

  return {
    title: t("orders"),
  };
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tHeader = await getTranslations("AdminOrders");

  const resolvedSearchParams = await searchParams;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;
  const statusParam =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : undefined;

  // Validate status parameter
  const status =
    statusParam &&
    (orderStatusEnum.enumValues as readonly string[]).includes(statusParam)
      ? statusParam
      : undefined;

  // Fetch filtered orders
  const ordersRes = await adminApiClient.orders.list(
    status ? { status } : undefined,
  );
  const orders: AdminOrder[] =
    "items" in ordersRes
      ? ordersRes.items
      : Array.isArray(ordersRes)
        ? ordersRes
        : [];

  // In-memory search filtering (ID, user name, email, company)
  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(search.toLowerCase()) ||
          (o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ??
            false) ||
          (o.customerName?.toLowerCase().includes(search.toLowerCase()) ??
            false) ||
          (o.user?.fullName.toLowerCase().includes(search.toLowerCase()) ??
            false) ||
          (o.user?.email.toLowerCase().includes(search.toLowerCase()) ??
            false) ||
          (o.companyName?.toLowerCase().includes(search.toLowerCase()) ??
            false),
      )
    : orders;

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
        <OrderList orders={filteredOrders} />
      </div>
    </>
  );
}
