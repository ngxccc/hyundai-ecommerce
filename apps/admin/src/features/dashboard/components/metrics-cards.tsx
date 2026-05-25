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
import { Card } from "@/shared/components/ui/card";

export const MetricsCards = () => {
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
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <TrendingUp className="mr-1 h-3.5 w-3.5" /> 12.5%
          </span>
        </div>
        <div className="text-primary text-3xl font-bold">2,000,000 VNĐ</div>
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
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <TrendingUp className="mr-1 h-3.5 w-3.5" /> 8.2%
          </span>
        </div>
        <div className="text-primary text-3xl font-bold">1,284</div>
        <div className="absolute right-0 bottom-0 left-0 h-12 border-b-2 border-green-500 bg-linear-to-t from-green-500/10 to-transparent opacity-30"></div>
      </Card>

      {/* Products Card */}
      <Card className="relative flex min-h-35 flex-col justify-between overflow-hidden p-6 shadow-sm">
        <div className="mb-2 flex items-start justify-between">
          <div className="text-muted-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">{t("totalProducts")}</span>
          </div>
          <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
            <Minus className="mr-1 h-3.5 w-3.5" /> 0%
          </span>
        </div>
        <div className="text-primary text-3xl font-bold">342</div>
        <div className="bg-muted/50 absolute right-0 bottom-0 left-0 h-8"></div>
      </Card>

      {/* New Customers Card */}
      <Card className="relative flex min-h-35 flex-col justify-between overflow-hidden p-6 shadow-sm">
        <div className="mb-2 flex items-start justify-between">
          <div className="text-muted-foreground flex items-center gap-2">
            <UserPlus className="text-destructive h-5 w-5" />
            <span className="text-sm font-medium">{t("newCustomers")}</span>
          </div>
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <TrendingDown className="mr-1 h-3.5 w-3.5" /> 2.4%
          </span>
        </div>
        <div className="text-primary text-3xl font-bold">89</div>
        <div className="border-destructive from-destructive/10 absolute right-0 bottom-0 left-0 h-12 border-b-2 bg-linear-to-t to-transparent opacity-30"></div>
      </Card>
    </div>
  );
};
