"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
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
import { formatCurrency } from "@/lib/utils";
import { type CategoryDistribution } from "@/types/api";

interface CategoryDistributionChartProps {
  data: CategoryDistribution[];
}

const CHART_COLOR_TOKENS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export const CategoryDistributionChart = ({
  data = [],
}: CategoryDistributionChartProps) => {
  const t = useTranslations("adminDashboard.chart");

  const chartConfig = {
    revenue: {
      label: t("revenue"),
      color: "var(--color-chart-1)",
    },
  } satisfies ChartConfig;

  const chartData = data.map((item, index) => ({
    ...item,
    fill: CHART_COLOR_TOKENS[index % CHART_COLOR_TOKENS.length],
  }));

  return (
    <Card className="flex h-full flex-col gap-0">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base font-semibold">
          {t("categoryDistribution")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("categorySubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center p-4">
        {chartData.length === 0 ? (
          <div className="text-muted-foreground flex h-65 w-full items-center justify-center text-center text-xs">
            {t("noCategoryData")}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-65 w-full"
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                width={100}
              />
              <ChartTooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {t("revenue")}
                        </span>
                        <span className="text-foreground font-semibold">
                          {formatCurrency(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                animationDuration={500}
                dataKey="revenue"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
