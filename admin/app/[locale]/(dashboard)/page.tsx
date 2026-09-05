import { AdminHeader } from "@/features/dashboard/components/admin-header";
import { MetricsCards } from "@/features/dashboard/components/metrics-cards";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { TopProducts } from "@/features/dashboard/components/top-products";
import { RecentOrdersTable } from "@/features/dashboard/components/recent-orders-table";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";
import { api } from "@/lib/api-client";
import type { AdminOrder } from "@/types/api";
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
  const t = await getTranslations({ locale, namespace: "AdminMetadata" });

  return {
    title: t("dashboard"),
  };
}

export const AdminDashboard = async () => {
  // Fetch data in parallel
  const [metrics, monthlyRevenue, topProducts, allOrders] = await Promise.all([
    Promise.resolve({
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      newCustomers: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      customersGrowth: 0,
    }),
    Promise.resolve([]),
    Promise.resolve([]),
    api.GET("/orders", { params: { query: { limit: 5 } } }),
  ]);

  const ordersList: AdminOrder[] = allOrders.data?.data?.items ?? [];
  const recentOrders = ordersList.slice(0, 5);

  return (
    <>
      <AdminHeader />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        {/* KPI Cards */}
        <MetricsCards metrics={metrics} />

        {/* Main Chart & Top Products */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={monthlyRevenue} />
          </div>
          <div className="lg:col-span-1">
            <TopProducts products={topProducts} />
          </div>
        </div>

        {/* Recent Orders Table */}
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </>
  );
};

export default AdminDashboard;
