import { AdminHeader } from "@/features/dashboard/components/admin-header";
import { CachedDashboardAnalytics } from "@/features/dashboard/components/cached-dashboard-analytics";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { ordersApi } from "@/features/orders/api/orders.api";
import { analyticsApi } from "@/features/dashboard/api/analytics.api";
import { connection } from "next/server";
import type { AdminOrder } from "@/types/api";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminMetadata" });

  return {
    title: t("dashboard"),
  };
}

const ZERO_METRICS = {
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  newCustomers: 0,
  revenueGrowth: 0,
  ordersGrowth: 0,
  aovGrowth: 0,
  customersGrowth: 0,
};

const AdminDashboard = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  await connection();
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const currentYear = new Date().getFullYear();

  // Fetch real analytics and recent orders in parallel
  const [analyticsRes, allOrders] = await Promise.all([
    analyticsApi.getDashboard({ year: currentYear, locale }),
    ordersApi.list({ limit: 100 }),
  ]);

  const analyticsData = analyticsRes.data?.data;
  const ordersList: AdminOrder[] = allOrders.data?.data ?? [];
  const recentOrders = ordersList.slice(0, 5);

  const metrics = analyticsData?.metrics ?? ZERO_METRICS;
  const monthlyRevenue = analyticsData?.monthlyRevenue ?? [];
  const categoryDistribution = analyticsData?.categoryDistribution ?? [];
  const topProducts = analyticsData?.topProducts ?? [];

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminHeader />

      {/* Layered Caching: RSC Presentation Cache via Next.js 16 'use cache' */}
      <CachedDashboardAnalytics
        metrics={metrics}
        monthlyRevenue={monthlyRevenue}
        categoryDistribution={categoryDistribution}
        topProducts={topProducts}
        recentOrders={recentOrders}
        ordersList={ordersList}
      />
    </div>
  );
};

export default AdminDashboard;
