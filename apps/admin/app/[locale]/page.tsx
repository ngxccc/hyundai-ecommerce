import { AdminHeader } from "@/features/dashboard/components/admin-header";
import { MetricsCards } from "@/features/dashboard/components/metrics-cards";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { TopProducts } from "@/features/dashboard/components/top-products";
import { RecentOrdersTable } from "@/features/dashboard/components/recent-orders-table";

import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";

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

export default async function AdminDashboard() {
  return (
    <>
      <AdminHeader />

      <div className="mx-auto flex w-full flex-col gap-6 p-2">
        {/* KPI Cards */}
        <MetricsCards />

        {/* Main Chart & Top Products */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="lg:col-span-1">
            <TopProducts />
          </div>
        </div>

        {/* Recent Orders Table */}
        <RecentOrdersTable />
      </div>
    </>
  );
}
