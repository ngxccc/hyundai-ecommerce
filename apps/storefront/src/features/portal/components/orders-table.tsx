"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import { ClipboardList, Eye } from "lucide-react";
import type { ComplexOrder } from "@nhatnang/database/services";
import { priceFormatter } from "@nhatnang/shared/lib/utils";
import {
  getStatusDetails,
  getPaymentStatusDetails,
} from "./order-status-utils";

interface OrdersTableProps {
  orders: ComplexOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const locale = useLocale();
  const t = useTranslations("Orders");

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <ClipboardList className="mx-auto h-12 w-12 text-zinc-300" />
        <h3 className="mt-4 text-sm font-semibold text-zinc-900">
          {t("labels.noOrders")}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">{t("labels.noOrdersDesc")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto **:data-[slot=table-container]:scrollbar-none [&_[data-slot=table-container]::-webkit-scrollbar]:hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[15%] pl-6">
              {t("labels.orderCode")}
            </TableHead>
            <TableHead className="w-[20%]">{t("labels.orderDate")}</TableHead>
            <TableHead className="w-[30%]">{t("labels.products")}</TableHead>
            <TableHead className="text-right">{t("labels.total")}</TableHead>
            <TableHead className="text-center">
              {t("labels.statusLabel")}
            </TableHead>
            <TableHead className="text-center">
              {t("labels.paymentLabel")}
            </TableHead>
            <TableHead className="w-[10%] pr-6 text-right">
              {t("labels.actionsLabel")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusInfo = getStatusDetails(order.status, t);
            const paymentStatusInfo = getPaymentStatusDetails(
              order.paymentStatus,
              t,
            );
            const firstItemName = order.items[0]?.productName ?? "";
            const extraItemsCount = order.items.length - 1;

            return (
              <TableRow key={order.id} className="hover:bg-zinc-50/50">
                <TableCell className="pl-6 font-semibold text-zinc-950">
                  #{order.id.substring(0, 8)}
                </TableCell>
                <TableCell className="text-xs text-zinc-500">
                  {new Date(order.createdAt).toLocaleDateString(
                    locale === "vi" ? "vi-VN" : "en-US",
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-60 truncate text-sm font-medium text-zinc-800">
                    {firstItemName}
                    {extraItemsCount > 0 && (
                      <span className="text-xs font-normal text-zinc-400">
                        {t("labels.extraItems", {
                          count: extraItemsCount.toString(),
                        })}
                      </span>
                    )}
                  </div>
                  {order.user.companyName && (
                    <p className="mt-0.5 text-[10px] text-zinc-400">
                      {t("labels.placedBy")}{" "}
                      <span className="font-semibold text-zinc-500">
                        {order.user.name}
                      </span>
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold text-zinc-900">
                  {priceFormatter.format(parseFloat(order.totalAmount || "0"))}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${paymentStatusInfo.color}`}
                  >
                    {paymentStatusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-right">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
