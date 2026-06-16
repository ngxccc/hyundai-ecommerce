"use client";

import { useTransition, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
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
import { toast } from "@nhatnang/ui/components/ui/sonner";
import {
  FileText,
  User,
  MapPin,
  Clock,
  ArrowRight,
  XCircle,
  Undo2,
  CheckCircle2,
} from "lucide-react";
import type { ComplexOrder } from "@nhatnang/database/services";
import { updateOrderStatusAction } from "../actions";
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
  StepperNav,
} from "@nhatnang/ui/components/reui/stepper";
import { ShippingBidPanel } from "./shipping-bid-panel";

interface OrderDetailProps {
  order: ComplexOrder;
}

export const OrderDetail = ({ order }: OrderDetailProps) => {
  const t = useTranslations("AdminOrders");
  const [isPending, startTransition] = useTransition();
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "horizontal",
  );

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerWidth < 640 ? "vertical" : "horizontal");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-transparent dark:bg-yellow-900/30 dark:text-yellow-400";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700 border-transparent dark:bg-blue-900/30 dark:text-blue-400";
      case "SHIPPED":
        return "bg-purple-100 text-purple-700 border-transparent dark:bg-purple-900/30 dark:text-purple-400";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-transparent dark:bg-green-900/30 dark:text-green-400";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-transparent dark:bg-red-900/30 dark:text-red-400";
      case "REFUNDED":
        return "bg-gray-100 text-gray-700 border-transparent dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-secondary text-secondary-foreground border-transparent";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return t("statusPending");
      case "PROCESSING":
        return t("statusProcessing");
      case "SHIPPED":
        return t("statusShipped");
      case "DELIVERED":
        return t("statusDelivered");
      case "CANCELLED":
        return t("statusCancelled");
      case "REFUNDED":
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
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = (nextStatus: typeof order.status) => {
    startTransition(async () => {
      try {
        const result = await updateOrderStatusAction(order.id, nextStatus);
        if (result.success) {
          toast.success(t("statusUpdated"));
        } else {
          toast.error(result.error ?? t("statusUpdateError"));
        }
      } catch (err) {
        console.error(err);
        toast.error(t("statusUpdateError"));
      }
    });
  };

  // Timeline Steps setup
  const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStepIndex = steps.indexOf(order.status);
  const isEndState =
    order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left side (Timeline Stepper & Items list) */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        {/* Stepper Card */}
        <Card className="border-border bg-card flex flex-col gap-6 border p-4 shadow-sm">
          <div className="border-border flex items-center justify-between border-b pb-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-5 w-5" />
                <h3 className="text-lg font-bold">
                  {t("timelineFulfillment")}
                </h3>
              </div>
              <span className="text-muted-foreground text-xs">
                {t("orderedOn", { date: formatDate(order.createdAt) })}
              </span>
            </div>
            <Badge className={getStatusBadgeClass(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          {!isEndState ? (
            <div className="px-2 py-4">
              <Stepper
                value={currentStepIndex + 1}
                orientation={orientation}
                indicators={{
                  completed: <CheckCircle2 className="h-5 w-5" />,
                }}
              >
                <StepperNav className="w-full flex-col items-start sm:flex-row sm:items-start sm:justify-between">
                  {steps.map((step, idx) => {
                    const stepVal = idx + 1;
                    return (
                      <StepperItem
                        key={step}
                        step={stepVal}
                        disabled={true}
                        className="relative flex-1 group-data-[orientation=vertical]/stepper-nav:items-start group-data-[orientation=vertical]/stepper-nav:justify-start sm:min-w-0 sm:flex-col! sm:items-center! sm:justify-start! sm:last:flex-1"
                      >
                        <StepperTrigger className="pointer-events-none flex cursor-default flex-row items-center gap-3 select-none sm:flex-col sm:items-center sm:gap-2">
                          <StepperIndicator className="data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-primary-foreground data-[state=active]:ring-primary/20 size-8 text-sm font-bold data-[state=active]:ring-4 data-[state=completed]:border-green-500 data-[state=completed]:bg-green-500 data-[state=completed]:text-white">
                            {idx + 1}
                          </StepperIndicator>
                          <StepperTitle className="data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground text-sm font-semibold data-[state=completed]:text-slate-800 sm:text-center dark:data-[state=completed]:text-slate-200">
                            {getStatusLabel(step)}
                          </StepperTitle>
                        </StepperTrigger>
                        {idx < steps.length - 1 && (
                          <>
                            {/* Horizontal separator for desktop */}
                            <StepperSeparator className="absolute top-3.75 left-[calc(50%+16px)] hidden h-0.5 w-[calc(100%-32px)] bg-slate-200 data-[state=completed]:bg-green-500 sm:m-0 sm:block" />
                            {/* Vertical separator for mobile */}
                            <StepperSeparator className="my-1 ml-3.5 block h-6 w-0.5 bg-slate-200 data-[state=completed]:bg-green-500 sm:hidden" />
                          </>
                        )}
                      </StepperItem>
                    );
                  })}
                </StepperNav>
              </Stepper>
            </div>
          ) : (
            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                order.status === "CANCELLED"
                  ? "border-red-500/30 bg-red-50/10 text-red-600 dark:text-red-400"
                  : "border-gray-500/30 bg-gray-50/10 text-gray-600 dark:text-gray-400"
              }`}
            >
              <XCircle className="h-6 w-6 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">
                  {order.status === "CANCELLED"
                    ? t("statusCancelled")
                    : t("statusRefunded")}
                </span>
                <span className="text-muted-foreground text-xs">
                  {t("orderFinalizedStatus", {
                    status: getStatusLabel(order.status),
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Stepper Transition Action buttons */}
          {!isEndState && order.status !== "DELIVERED" && (
            <div className="border-border mt-2 flex flex-wrap items-center justify-end gap-3 border-t pt-4">
              {order.status === "PENDING" && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    className="gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    {t("btnCancelOrder")}
                  </Button>
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusUpdate("PROCESSING")}
                    className="gap-1.5"
                  >
                    {t("btnMarkProcessing")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {order.status === "PROCESSING" && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    className="gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    {t("btnCancelOrder")}
                  </Button>
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusUpdate("SHIPPED")}
                    className="gap-1.5"
                  >
                    {t("btnMarkShipped")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {order.status === "SHIPPED" && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    className="gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    {t("btnCancelOrder")}
                  </Button>
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusUpdate("DELIVERED")}
                    className="gap-1.5"
                  >
                    {t("btnMarkDelivered")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}

          {order.status === "DELIVERED" && (
            <div className="border-border mt-2 flex items-center justify-end border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleStatusUpdate("REFUNDED")}
                className="gap-1.5 border-red-500/30 text-red-600 hover:bg-red-50/15 dark:text-red-400"
              >
                <Undo2 className="h-4 w-4" />
                {t("btnProcessRefund")}
              </Button>
            </div>
          )}
        </Card>

        {/* Order Items Table Card */}
        <Card className="border-border bg-card gap-0 overflow-hidden border py-0 shadow-sm">
          <div className="border-border bg-card/50 border-b px-6 py-4">
            <h3 className="text-lg font-bold">{t("orderItems")}</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">
                    {t("itemProduct")}
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    {t("itemPrice")}
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    {t("itemQty")}
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    {t("itemTotal")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => {
                  const unitPrice = parseFloat(item.unitPrice);
                  const subtotal = unitPrice * item.quantity;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-75">
                        <div className="flex flex-col">
                          <span className="text-primary text-sm font-medium">
                            {item.productName}
                          </span>
                          <span className="text-muted-foreground font-mono text-xs">
                            SKU: {item.productSku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right text-sm font-bold">
                        {formatCurrency(subtotal.toString())}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Total Calculations */}
                <TableRow className="bg-muted/10 hover:bg-muted/10">
                  <TableCell
                    colSpan={3}
                    className="text-right text-sm font-semibold"
                  >
                    {t("invoiceShippingFee")}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {formatCurrency(order.shippingFee)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/20 hover:bg-muted/20 border-border border-t font-bold">
                  <TableCell colSpan={3} className="text-right text-base">
                    {t("invoiceTotalPayment")}
                  </TableCell>
                  <TableCell className="text-primary text-right text-base">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
        <ShippingBidPanel order={order} />
      </div>

      {/* Right side (Buyer portfolio & Invoice trigger) */}
      <div className="flex flex-col gap-6">
        {/* Buyer Portfolio Card */}
        <Card className="border-border bg-card flex flex-col gap-6 border p-4 shadow-sm">
          <div className="border-border flex items-center gap-2 border-b pb-4">
            <User className="text-muted-foreground h-5 w-5" />
            <h3 className="text-lg font-bold">{t("buyerInfo")}</h3>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xxs font-semibold tracking-wider uppercase">
                {t("accountOwner")}
              </span>
              <span className="text-foreground mt-0.5 text-base font-semibold">
                {order.user?.name || t("unknown")}
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {order.user?.email || ""}
              </span>
            </div>

            {order.user?.companyName && (
              <div className="border-border/50 flex flex-col border-t pt-3">
                <span className="text-muted-foreground text-xxs font-semibold tracking-wider uppercase">
                  {t("corporateEntity")}
                </span>
                <span className="text-primary mt-0.5 font-bold">
                  {order.user.companyName}
                </span>
                {order.user.taxId && (
                  <span className="text-muted-foreground mt-0.5 text-xs">
                    {t("taxId")}: {order.user.taxId}
                  </span>
                )}
              </div>
            )}

            <div className="border-border/50 flex flex-col border-t pt-3">
              <span className="text-muted-foreground text-xxs font-semibold tracking-wider uppercase">
                {t("contactPhone")}
              </span>
              <span className="mt-0.5 font-mono text-sm">
                {order.user?.phone || ""}
              </span>
            </div>

            <div className="border-border/50 flex flex-col border-t pt-3">
              <span className="text-muted-foreground text-xxs font-semibold tracking-wider uppercase">
                {t("businessType")}
              </span>
              <Badge className="bg-secondary text-secondary-foreground mt-1 w-fit border-transparent text-xs capitalize">
                {order.user?.businessType
                  ? order.user.businessType.replace("_", " ")
                  : t("endUser")}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Shipping Address Card */}
        <Card className="border-border bg-card flex flex-col gap-6 border p-4 shadow-sm">
          <div className="border-border flex items-center gap-2 border-b pb-4">
            <MapPin className="text-muted-foreground h-5 w-5" />
            <h3 className="text-lg font-bold">{t("shippingAddress")}</h3>
          </div>
          <div className="text-sm">
            <p className="text-foreground leading-relaxed font-medium whitespace-pre-wrap">
              {order.shippingAddress}
            </p>
          </div>
        </Card>

        {/* Invoice Generator Card */}
        <Card className="border-border bg-card flex flex-col gap-4 border p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-bold">{t("invoiceCardTitle")}</h4>
            <p className="text-muted-foreground text-xs">
              {t("invoiceCardDescription")}
            </p>
          </div>

          <Link href={`/orders/${order.id}/invoice`} className="w-full">
            <Button className="w-full gap-2">
              <FileText className="h-4 w-4" />
              {t("printInvoice")}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
