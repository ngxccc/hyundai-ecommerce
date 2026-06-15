"use client";

import { useTranslations } from "next-intl";
import { Filter, Download } from "lucide-react";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";

import type { ComplexOrder } from "@nhatnang/database/services";

interface RecentOrdersTableProps {
  orders: ComplexOrder[];
}

const statusMap: Record<string, string> = {
  PENDING: "processing",
  PROCESSING: "processing",
  SHIPPED: "shipping",
  DELIVERED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "cancelled",
};

const statusClassMap: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-400",
  PROCESSING:
    "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-400",
  SHIPPED:
    "bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400",
  DELIVERED:
    "bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED:
    "bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED:
    "bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400",
};

const formatVND = (value: string | number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value));
};

export const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => {
  const t = useTranslations("AdminDashboard.recentOrders");

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <div className="border-border/50 bg-card flex flex-col items-start justify-between gap-4 border-b px-2 py-4 min-[400px]:flex-row sm:items-center sm:p-4">
        <h3 className="text-primary text-xl font-semibold">{t("title")}</h3>
        <div className="flex gap-2 sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {t("filter")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            {t("export")}
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-30">{t("columns.orderId")}</TableHead>
            <TableHead>{t("columns.customer")}</TableHead>
            <TableHead>{t("columns.product")}</TableHead>
            <TableHead>{t("columns.date")}</TableHead>
            <TableHead className="text-right">{t("columns.total")}</TableHead>
            <TableHead className="text-center">{t("columns.status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const customerName = order.user?.name || "Customer";
            const initial = customerName.charAt(0).toUpperCase();
            const firstItem = order.items[0];
            const productText = firstItem
              ? `${firstItem.productName}${order.items.length > 1 ? ` + ${order.items.length - 1}` : ""}`
              : "No Product";
            const formattedDate = new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(order.createdAt));

            const uiStatus = (statusMap[order.status] ?? "processing") as
              | "completed"
              | "processing"
              | "shipping"
              | "cancelled";
            const badgeClass =
              statusClassMap[order.status] ?? statusClassMap["PENDING"];

            return (
              <TableRow key={order.id}>
                <TableCell className="text-primary font-medium">
                  #{order.id.slice(-6).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                      {initial}
                    </div>
                    <span>{customerName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-60 truncate">
                  {productText}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formattedDate}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatVND(order.totalAmount)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="secondary"
                    className={`border-transparent font-medium ${badgeClass}`}
                  >
                    {t(`status.${uiStatus}`)}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="border-border/50 border-t py-2 text-center">
        <Button variant="link" className="text-primary text-sm font-medium">
          {t("viewAll")}
        </Button>
      </div>
    </Card>
  );
};
