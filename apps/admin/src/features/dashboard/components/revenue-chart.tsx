"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export const RevenueChart = () => {
  const t = useTranslations("AdminDashboard.chart");

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
        <div className="text-muted-foreground absolute top-0 bottom-0 left-0 flex w-12 flex-col justify-between pb-6 text-xs">
          <span>400M</span>
          <span>300M</span>
          <span>200M</span>
          <span>100M</span>
          <span>0</span>
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
          {[
            { month: "T1", height: "40%", val: "120M" },
            { month: "T2", height: "65%", val: "190M" },
            { month: "T3", height: "50%", val: "150M" },
            { month: "T4", height: "80%", val: "240M" },
            { month: "T5", height: "45%", val: "135M" },
            { month: "T6", height: "90%", val: "270M", active: true },
            { month: "T7", height: "70%", val: "210M" },
          ].map((bar, i) => (
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
