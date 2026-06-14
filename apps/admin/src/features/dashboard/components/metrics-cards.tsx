"use client";

import { useTranslations } from "next-intl";
import {
  DollarSign,
  ShoppingBag,
  Package,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card } from "@nhatnang/ui/components/ui/card";
import type { DashboardMetrics } from "@nhatnang/database/services";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

const formatVND = (value: string | number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value));
};

const GrowthBadge = ({ value }: { value: number }) => {
  if (value > 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <TrendingUp className="mr-1 h-3.5 w-3.5" /> {value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <TrendingDown className="mr-1 h-3.5 w-3.5" /> {Math.abs(value)}%
      </span>
    );
  }
  return (
    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
      <Minus className="mr-1 h-3.5 w-3.5" /> 0%
    </span>
  );
};

export const MetricsCards = ({ metrics }: MetricsCardsProps) => {
  const t = useTranslations("AdminDashboard.metrics");

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <Card className="relative flex min-h-35 flex-col justify-between overflow-hidden p-6 shadow-sm">
        <div className="mb-2 flex items-start justify-between">
          <div className="text-muted-foreground flex items-center gap-2">
            <DollarSign className="text-primary h-5 w-5" />
            <span className="text-sm font-medium">{t("totalRevenue")}</span>
          </div>
          <GrowthBadge value={metrics.revenueGrowth} />
        </div>
        <div className="text-primary text-3xl font-bold">
          {formatVND(metrics.totalRevenue)}
        </div>
        {/* Decorative Sparkline */}
        <div className="absolute right-0 bottom-0 left-0 h-12 border-b-2 border-green-500 bg-linear-to-t from-green-500/10 to-transparent opacity-30"></div>
      </Card>

      {/* Orders Card */}
      <Card className="relative flex min-h-35 flex-col justify-between overflow-hidden p-6 shadow-sm">
        <div className="mb-2 flex items-start justify-between">
          <div className="text-muted-foreground flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium">{t("totalOrders")}</span>
          </div>
          <GrowthBadge value={metrics.ordersGrowth} />
        </div>
        <div className="text-primary text-3xl font-bold">
          {new Intl.NumberFormat().format(metrics.totalOrders)}
        </div>
        <div className="absolute right-0 bottom-0 left-0 h-12 border-b-2 border-green-500 bg-linear-to-t from-green-500/10 to-transparent opacity-30"></div>
      </Card>

      {/* Products Card */}
      <Card className="relative flex min-h-35 flex-col justify-between overflow-hidden p-6 shadow-sm">
        <div className="mb-2 flex items-start justify-between">
          <div className="text-muted-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">{t("totalProducts")}</span>
          </div>
          <GrowthBadge value={0} />
        </div>
        <div className="text-primary text-3xl font-bold">
          {new Intl.NumberFormat().format(metrics.totalProducts)}
        </div>
        <div className="bg-muted/50 absolute right-0 bottom-0 left-0 h-8"></div>
      </Card>

      {/* New Customers Card */}
      <Card className="relative flex min-h-35 flex-col justify-between overflow-hidden p-6 shadow-sm">
        <div className="mb-2 flex items-start justify-between">
          <div className="text-muted-foreground flex items-center gap-2">
            <UserPlus className="text-destructive h-5 w-5" />
            <span className="text-sm font-medium">{t("newCustomers")}</span>
          </div>
          <GrowthBadge value={metrics.customersGrowth} />
        </div>
        <div className="text-primary text-3xl font-bold">
          {new Intl.NumberFormat().format(metrics.newCustomers)}
        </div>
        <div className="border-destructive from-destructive/10 absolute right-0 bottom-0 left-0 h-12 border-b-2 bg-linear-to-t to-transparent opacity-30"></div>
      </Card>
    </div>
  );
};
