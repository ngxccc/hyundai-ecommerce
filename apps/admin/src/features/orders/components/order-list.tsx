"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@nhatnang/ui/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Card } from "@nhatnang/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Search, Eye } from "lucide-react";
import type { ComplexOrder } from "@nhatnang/database/services";
import { orderStatusEnum } from "@nhatnang/database/schemas";

interface OrderListProps {
  orders: ComplexOrder[];
}

export const OrderList = ({ orders }: OrderListProps) => {
  const t = useTranslations("AdminOrders");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );
  const activeStatus = searchParams.get("status") ?? "all";

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearchTerm !== currentSearch) {
      handleFilterChange("search", debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleFilterChange, searchParams]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-transparent dark:bg-yellow-900/30 dark:text-yellow-400";
      case "processing":
        return "bg-blue-100 text-blue-700 border-transparent dark:bg-blue-900/30 dark:text-blue-400";
      case "shipped":
        return "bg-purple-100 text-purple-700 border-transparent dark:bg-purple-900/30 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 text-green-700 border-transparent dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-700 border-transparent dark:bg-red-900/30 dark:text-red-400";
      case "refunded":
        return "bg-gray-100 text-gray-700 border-transparent dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-secondary text-secondary-foreground border-transparent";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return t("statusPending");
      case "processing":
        return t("statusProcessing");
      case "shipped":
        return t("statusShipped");
      case "delivered":
        return t("statusDelivered");
      case "cancelled":
        return t("statusCancelled");
      case "refunded":
        return t("statusRefunded");
      default:
        return status;
    }
  };

  const formatCurrency = (amountStr: string) => {
    const amount = parseFloat(amountStr);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statuses = ["all", ...orderStatusEnum.enumValues];

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filters Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Custom tabs logic */}
        <div className="border-border flex flex-wrap gap-1 border-b pb-2 md:border-b-0 md:pb-0">
          {statuses.map((status) => (
            <Button
              key={status}
              variant={activeStatus === status ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange("status", status)}
              className="h-8 text-xs font-medium capitalize"
            >
              {status === "all" ? t("statusAll") : getStatusLabel(status)}
            </Button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-lg font-medium">
            {t("noOrders")}
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="border-border bg-card hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">
                    {t("tableOrderId")}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {t("tableCustomer")}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {t("tableDate")}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {t("tableTotal")}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {t("tableStatus")}
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    {t("tableActions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      #{order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {order.user?.name || t("unknown")}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {order.user?.email || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <Eye className="h-4 w-4" />
                          {t("viewDetail")}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards Grid View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="border-border bg-card flex flex-col gap-4 border p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-xs font-bold">
                    #{order.id.slice(0, 8)}...
                  </span>
                  <Badge className={getStatusBadgeClass(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {order.user?.name || t("unknown")}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {order.user?.email || ""}
                    </span>
                  </div>
                  <span className="text-muted-foreground mt-1 text-xs">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="border-border mt-1 flex items-center justify-between border-t pt-3">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xxs font-semibold tracking-wider uppercase">
                      {t("tableTotal")}
                    </span>
                    <span className="text-primary text-sm font-bold">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {t("viewDetail")}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
