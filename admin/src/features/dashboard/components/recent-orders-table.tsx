import { getTranslations } from "next-intl/server";
import { Filter, Download } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { AdminOrder } from "@/types/api";

interface RecentOrdersTableProps {
  orders: AdminOrder[];
}
const orderDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const statusMap: Record<string, string> = {
  PENDING: "processing",
  PROCESSING: "processing",
  SHIPPED: "shipping",
  DELIVERED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "cancelled",
};
interface OrderStatusBadgeProps {
  label: string;
}

const OrderStatusBadge = ({ label }: OrderStatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className="border-border/80 bg-muted/40 text-foreground rounded px-2 py-0.5 text-[11px] font-medium shadow-none"
    >
      {label}
    </Badge>
  );
};

export async function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const t = await getTranslations("adminDashboard.recentOrders");
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <div className="border-border/50 bg-card flex flex-col items-start justify-between gap-4 border-b px-4 py-4 min-[400px]:flex-row sm:items-center">
        <h3 className="text-foreground text-base font-semibold">
          {t("title")}
        </h3>
        <div className="flex gap-2 sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 text-xs font-medium"
          >
            <Filter className="mr-1.5 size-3.5" />
            {t("filter")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 text-xs font-medium"
          >
            <Download className="mr-1.5 size-3.5" />
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
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground h-24 text-center text-xs"
              >
                {t("noOrders")}
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const customerName =
                order.user?.fullName ?? order.customerName ?? "Customer";
              const items = order.items;
              let productText = "Không có sản phẩm";
              if (items.length > 0) {
                const firstItem = items[0];
                const productName =
                  firstItem.product?.name ?? firstItem.productName;
                productText =
                  items.length > 1
                    ? `${productName} + ${items.length - 1}`
                    : productName;
              }
              const formattedDate = orderDateFormatter.format(
                new Date(order.createdAt),
              );

              const uiStatus = (statusMap[order.status] ?? "processing") as
                "completed" | "processing" | "shipping" | "cancelled";

              return (
                <TableRow key={order.id}>
                  <TableCell className="text-foreground font-mono text-xs font-medium">
                    <Link
                      href={`/orders/${order.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      #{order.id.slice(-6).toUpperCase()}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-xs font-medium">
                        {customerName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-60 truncate text-xs">
                    {productText}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formattedDate}
                  </TableCell>
                  <TableCell className="text-foreground text-right text-xs font-medium">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderStatusBadge label={t(`status.${uiStatus}`)} />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <div className="border-border/50 border-t py-2.5 text-center">
        <Button
          variant="link"
          asChild
          className="text-primary text-xs font-medium"
        >
          <Link href="/orders">{t("viewAll")}</Link>
        </Button>
      </div>
    </Card>
  );
}
