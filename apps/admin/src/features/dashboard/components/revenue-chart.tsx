"use client";

import { useTranslations } from "next-intl";
import { Card } from "@nhatnang/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nhatnang/ui/components/ui/select";

import type { IMonthlyRevenue } from "@nhatnang/database/services";

interface RevenueChartProps {
  data: IMonthlyRevenue[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const t = useTranslations("AdminDashboard.chart");

  const maxRevenue = Math.max(...data.map((d) => parseFloat(d.revenue)), 0);
  const currentMonthStr = (new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0");

  const formatBarValue = (val: number) => {
    if (val >= 1000000000) {
      return `${(val / 1000000000).toFixed(1)}B`;
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(0)}M`;
    }
    return new Intl.NumberFormat().format(val);
  };

  const bars = data.map((d) => {
    const revenueVal = parseFloat(d.revenue);
    const heightPercentage =
      maxRevenue > 0 ? (revenueVal / maxRevenue) * 90 : 0;
    return {
      month: `T${parseInt(d.month, 10)}`,
      height: `${Math.round(heightPercentage)}%`,
      val: formatBarValue(revenueVal),
      active: d.month === currentMonthStr,
    };
  });

  const yAxisLabels = [
    formatBarValue(maxRevenue),
    formatBarValue(maxRevenue * 0.75),
    formatBarValue(maxRevenue * 0.5),
    formatBarValue(maxRevenue * 0.25),
    "0",
  ];
  return (
    <Card className="flex h-full flex-col p-3 shadow-sm">
      <div className="border-border/50 mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <h3 className="text-primary text-xl font-semibold">{t("title")}</h3>
        <div className="flex gap-2">
          <Select defaultValue="2026">
            <SelectTrigger className="h-8 w-25 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TODO: sử dụng thư viên chart bên ngoài */}
      {/* Faux Chart Representation */}
      <div className="relative mt-4 flex h-62.5 flex-1 items-end gap-2">
        {/* Y-axis labels */}
        <div className="text-muted-foreground absolute top-0 bottom-0 left-0 flex w-12 flex-col justify-between pr-2 pb-6 text-right text-xs">
          {yAxisLabels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>

        {/* Grid lines */}
        <div className="absolute top-0 right-0 bottom-6 left-12 z-0 flex flex-col justify-between">
          <div className="border-border/40 w-full border-t border-dashed"></div>
          <div className="border-border/40 w-full border-t border-dashed"></div>
          <div className="border-border/40 w-full border-t border-dashed"></div>
          <div className="border-border/40 w-full border-t border-dashed"></div>
          <div className="border-border w-full border-t border-solid"></div>
        </div>

        {/* Bars Container */}
        <div className="z-10 ml-12 flex h-full flex-1 items-end justify-around pb-6">
          {bars.map((bar, i) => (
            <div key={i} className="flex w-full max-w-10 flex-col items-center">
              <div
                className={`group relative w-full cursor-pointer rounded-t-sm transition-all hover:brightness-110 ${bar.active ? "bg-primary" : "bg-primary/50"}`}
                style={{ height: bar.height }}
              >
                <div className="bg-foreground text-background pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                  {bar.val}
                </div>
              </div>
              <span
                className={`mt-2 text-xs ${bar.active ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                {bar.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
