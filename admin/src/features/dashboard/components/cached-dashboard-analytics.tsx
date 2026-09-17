import { cacheLife, cacheTag } from "next/cache";
import { MetricsCards } from "./metrics-cards";
import { RevenueChart } from "./revenue-chart";
import { CategoryDistributionChart } from "./category-distribution-chart";
import { TopProducts } from "./top-products";
import { RecentOrdersTable } from "./recent-orders-table";
import type {
  AdminOrder,
  DashboardMetrics,
  MonthlyRevenue,
  CategoryDistribution,
  TopSellingProduct,
} from "@/types/api";

interface CachedDashboardAnalyticsProps {
  metrics: DashboardMetrics;
  monthlyRevenue: MonthlyRevenue[];
  categoryDistribution: CategoryDistribution[];
  topProducts: TopSellingProduct[];
  recentOrders: AdminOrder[];
  ordersList: AdminOrder[];
}

/**
 * Enterprise Dashboard Analytics Presentation Section.
 * Implements Next.js 16 official `cacheComponents` & `'use cache'` directive to cache
 * the pre-rendered React Server Component (RSC) tree for 1 minute.
 *
 * @param props - Metrics, time series, category breakdown, and recent orders
 */
export async function CachedDashboardAnalytics({
  metrics,
  monthlyRevenue,
  categoryDistribution,
  topProducts,
  recentOrders,
  ordersList,
}: CachedDashboardAnalyticsProps) {
  "use cache";
  cacheLife("minutes");
  cacheTag("analytics");

  await Promise.resolve();

  return (
    <>
      {/* Tier 1: KPI Metrics Cards */}
      <MetricsCards metrics={metrics} />

      {/* Tier 2: Interactive Revenue Chart & Category Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyRevenue} orders={ordersList} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDistributionChart data={categoryDistribution} />
        </div>
      </div>

      {/* Tier 3: Recent Orders Table & Top Selling Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
        <div className="lg:col-span-1">
          <TopProducts products={topProducts} />
        </div>
      </div>
    </>
  );
}
