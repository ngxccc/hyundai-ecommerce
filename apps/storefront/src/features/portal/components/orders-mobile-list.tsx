"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Card, CardContent } from "@nhatnang/ui/components/ui/card";
import { Eye } from "lucide-react";
import type { ComplexOrder } from "@nhatnang/database/services";
import { priceFormatter } from "@nhatnang/shared/lib/utils";
import {
  getStatusDetails,
  getPaymentStatusDetails,
} from "./order-status-utils";

interface OrdersMobileListProps {
  orders: ComplexOrder[];
}

export function OrdersMobileList({ orders }: OrdersMobileListProps) {
  const locale = useLocale();
  const t = useTranslations("Orders");

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        {t("labels.noOrders")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = getStatusDetails(order.status, t);
        const paymentStatusInfo = getPaymentStatusDetails(
          order.paymentStatus,
          t,
        );
        const firstItemName = order.items[0]?.productName ?? "";
        const extraItemsCount = order.items.length - 1;

        return (
          <Card
            key={order.id}
            className="overflow-hidden border border-zinc-200 py-0 shadow-sm"
          >
            <CardContent className="space-y-3 p-4">
              {/* Row 1: Order ID & Status Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-950">
                  #{order.id.substring(0, 8)}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${paymentStatusInfo.color}`}
                  >
                    {paymentStatusInfo.label}
                  </Badge>
                </div>
              </div>

              {/* Row 2: Date & Product Summary */}
              <div className="space-y-1">
                <div className="text-xs text-zinc-500">
                  {new Date(order.createdAt).toLocaleDateString(
                    locale === "vi" ? "vi-VN" : "en-US",
                  )}
                </div>
                <div className="truncate text-sm font-medium text-zinc-800">
                  {firstItemName}
                  {extraItemsCount > 0 && (
                    <span className="ml-1 text-xs font-normal text-zinc-400">
                      {t("labels.extraItems", {
                        count: extraItemsCount.toString(),
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Buyer info (mostly B2B approvals) */}
              {order.user.companyName && (
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-2 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700">
                    {t("labels.placedBy")}:{" "}
                  </span>
                  {order.user.name} ({order.user.companyName})
                </div>
              )}

              {/* Row 4: Total & Details Action Button */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                    {t("labels.total")}
                  </span>
                  <span className="text-sm font-bold text-zinc-900">
                    {priceFormatter.format(
                      parseFloat(order.totalAmount || "0"),
                    )}
                  </span>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg"
                >
                  <Link href={`/portal/orders/${order.id}`}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    {t("labels.details")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
