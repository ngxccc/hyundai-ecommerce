import { AdminHeader } from "@/features/dashboard/components/admin-header";
import { MetricsCards } from "@/features/dashboard/components/metrics-cards";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { TopProducts } from "@/features/dashboard/components/top-products";
import { RecentOrdersTable } from "@/features/dashboard/components/recent-orders-table";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";
import { orderService, productService } from "@nhatnang/database/services";

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
  const t = await getTranslations({ locale, namespace: "AdminMetadata" });

  return {
    title: t("dashboard"),
  };
}

export const AdminDashboard = async () => {
  const currentYear = new Date().getFullYear();

  // Fetch data in parallel
  const [metrics, monthlyRevenue, topProducts, allOrders] = await Promise.all([
    orderService.getDashboardMetrics(),
    orderService.getMonthlyRevenue(currentYear),
    productService.getTopSellingProducts(5),
    orderService.listOrders(),
  ]);

  const recentOrders = allOrders.slice(0, 5);

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
