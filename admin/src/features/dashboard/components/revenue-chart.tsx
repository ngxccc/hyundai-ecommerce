"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatVNDShort } from "@/lib/utils";
import type { AdminOrder, MonthlyRevenue } from "@/types/api";
import {
  aggregateRevenueByMonth,
  aggregateRevenueByDays,
  getAvailableYears,
  formatMonthLabel,
} from "../lib/analytics";

interface RevenueChartProps {
  data?: MonthlyRevenue[];
  orders?: AdminOrder[];
  availableYears?: number[];
  initialYear?: number;
}

type TimeRange = "7d" | "30d" | "12m";

export const RevenueChart = ({
  data,
  orders = [],
  availableYears: propYears,
  initialYear,
}: RevenueChartProps) => {
  const t = useTranslations("adminDashboard.chart");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    if (propYears && propYears.length > 0) return propYears;
    return getAvailableYears(orders);
  }, [propYears, orders]);

  const defaultYear = years.length > 0 ? years[0] : currentYear;
  const [selectedYear, setSelectedYear] = useState<number>(
    initialYear ?? defaultYear,
  );
  const [timeRange, setTimeRange] = useState<TimeRange>("12m");

  const chartConfig = {
    revenue: {
      label: t("revenue"),
      color: "var(--color-chart-1)",
    },
    orders: {
      label: t("orders"),
      color: "var(--color-chart-3)",
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    if (timeRange === "7d") {
      return aggregateRevenueByDays(orders, 7);
    }
    if (timeRange === "30d") {
      return aggregateRevenueByDays(orders, 30);
    }

    // 12 months for the selected year
    if (data && data.length > 0) {
      const filtered = data.filter((d) => d.year === selectedYear);
      if (filtered.length > 0) {
        return filtered.map((d) => ({
          label: formatMonthLabel(d.month, locale),
          revenue: d.revenue,
          orders: d.orders,
        }));
      }
    }

    const aggregated = aggregateRevenueByMonth(orders, selectedYear);
    return aggregated.map((d) => ({
      label: formatMonthLabel(d.month, locale),
      revenue: d.revenue,
      orders: d.orders,
    }));
  }, [data, orders, selectedYear, timeRange, locale]);

  const totalRevenue = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [chartData]);

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-xs">{t("subtitle")}</CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic Year Selector with sufficient width for 'Năm YYYY' */}
          <Select
            value={String(selectedYear)}
            onValueChange={(val) => setSelectedYear(Number(val))}
          >
            <SelectTrigger className="h-8 w-auto text-xs font-medium">
              <SelectValue placeholder={String(currentYear)} />
            </SelectTrigger>
            <SelectContent align="end">
              {years.map((yr) => (
                <SelectItem key={yr} value={String(yr)}>
                  Năm {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Time Range Selector */}
          <Select
            value={timeRange}
            onValueChange={(val) => setTimeRange(val as TimeRange)}
          >
            <SelectTrigger className="h-8 w-auto text-xs font-medium">
              <SelectValue placeholder={t("range12m")} />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="7d">{t("range7d")}</SelectItem>
              <SelectItem value="30d">{t("range30d")}</SelectItem>
              <SelectItem value="12m">{t("range12m")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-foreground text-2xl font-bold tracking-tight">
            {formatCurrency(totalRevenue)}
          </span>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-65 w-full"
        >
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              opacity={0.6}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              stroke="var(--color-muted-foreground)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              stroke="var(--color-muted-foreground)"
              tickFormatter={formatVNDShort}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {name === "revenue" ? t("revenue") : t("orders")}
                      </span>
                      <span className="text-foreground font-semibold">
                        {name === "revenue"
                          ? formatCurrency(Number(value))
                          : value}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              animationDuration={500}
              dataKey="revenue"
              type="monotone"
              fill="var(--color-chart-1)"
              fillOpacity={0.12}
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              activeDot={{
                r: 4,
                fill: "var(--color-chart-1)",
                stroke: "var(--color-background)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
