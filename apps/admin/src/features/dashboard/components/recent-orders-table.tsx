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

type OrderStatus = "completed" | "processing" | "shipping" | "cancelled";

const MOCK_ORDERS = [
  {
    id: "#ORD-001",
    customer: "Nguyễn Văn A",
    initial: "N",
    product: "Hyundai HY-30CLE",
    date: "12 Th06, 2026",
    total: "12,500,000 đ",
    status: "completed",
    statusClass:
      "bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400",
    initialClass: "bg-primary/10 text-primary",
  },
  {
    id: "#ORD-002",
    customer: "Trần Thị B",
    initial: "T",
    product: "Trạm sạc HPgreen",
    date: "11 Th06, 2026",
    total: "8,500,000 đ",
    status: "processing",
    statusClass:
      "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-400",
    initialClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    id: "#ORD-003",
    customer: "Lê Văn C",
    initial: "L",
    product: "Hyundai HY-7000LE",
    date: "10 Th06, 2026",
    total: "18,200,000 đ",
    status: "shipping",
    statusClass:
      "bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400",
    initialClass:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    id: "#ORD-004",
    customer: "Phạm Thị D",
    initial: "P",
    product: "Máy phát điện Mitsubishi",
    date: "09 Th06, 2026",
    total: "45,000,000 đ",
    status: "cancelled",
    statusClass:
      "bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400",
    initialClass:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
];

export const RecentOrdersTable = () => {
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
          {MOCK_ORDERS.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="text-primary font-medium">
                {order.id}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${order.initialClass}`}
                  >
                    {order.initial}
                  </div>
                  <span>{order.customer}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.product}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.date}
              </TableCell>
              <TableCell className="text-right font-medium">
                {order.total}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="secondary"
                  className={`border-transparent font-medium ${order.statusClass}`}
                >
                  {t(`status.${order.status as OrderStatus}`)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
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
