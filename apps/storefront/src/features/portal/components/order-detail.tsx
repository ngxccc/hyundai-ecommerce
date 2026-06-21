"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import type { ComplexOrder } from "@nhatnang/database/services";
import type { UserRole } from "@nhatnang/database/schemas";
import { ShippingAddressCard } from "./shipping-address-card";
import { BuyerInfoCard } from "./buyer-info-card";
import { OrderProgress } from "./order-progress";
import {
  cancelOrderAction,
  approveB2BOrderAction,
} from "../actions/order.action";
import { reVerifyPaymentAction } from "@/features/checkout/actions";
import { B2BApprovalBanner } from "./b2b-approval-banner";
import { OrderItemsTable } from "./order-items-table";
import { OrderSummarySidebar } from "./order-summary-sidebar";
import { PaymentTransactionsCard } from "./payment-transactions-card";

interface OrderDetailProps {
  order: ComplexOrder;
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    companyName?: string | null;
  };
}

export function OrderDetail({ order, currentUser }: OrderDetailProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const t = useTranslations("Orders");

  // Status mappings
  const getStatusDetails = (status: ComplexOrder["status"]) => {
    switch (status) {
      case "PENDING":
        return {
          label: t("status.PENDING"),
          color: "bg-amber-100 text-amber-800",
        };
      case "PROCESSING":
        return {
          label: t("status.PROCESSING"),
          color: "bg-blue-100 text-blue-800",
        };
      case "SHIPPED":
        return {
          label: t("status.SHIPPED"),
          color: "bg-indigo-100 text-indigo-800",
        };
      case "DELIVERED":
        return {
          label: t("status.DELIVERED"),
          color: "bg-emerald-100 text-emerald-800",
        };
      case "CANCELLED":
        return {
          label: t("status.CANCELLED"),
          color: "bg-rose-100 text-rose-800",
        };
      case "REFUNDED":
        return {
          label: t("status.REFUNDED"),
          color: "bg-zinc-100 text-zinc-800",
        };
      case "REFUND_PENDING":
        return {
          label: t("status.REFUND_PENDING"),
          color: "bg-orange-100 text-orange-800",
        };
      case "SUSPICIOUS_PAYMENT_HOLD":
        return {
          label: t("status.SUSPICIOUS_PAYMENT_HOLD"),
          color: "bg-red-100 text-red-800",
        };
      case "CANCELLATION_REQUESTED":
        return {
          label: t("status.CANCELLATION_REQUESTED"),
          color: "bg-orange-100 text-orange-800",
        };
      default:
        return { label: status, color: "bg-zinc-100 text-zinc-800" };
    }
  };

  const getPaymentStatusDetails = (status: ComplexOrder["paymentStatus"]) => {
    switch (status) {
      case "UNPAID":
        return {
          label: t("paymentStatus.UNPAID"),
          color: "border-rose-200 text-rose-700 bg-rose-50/50",
        };
      case "DEPOSIT_PAID":
        return {
          label: t("paymentStatus.DEPOSIT_PAID"),
          color: "border-blue-200 text-blue-700 bg-blue-50/50",
        };
      case "FULLY_PAID":
        return {
          label: t("paymentStatus.FULLY_PAID"),
          color: "border-emerald-200 text-emerald-700 bg-emerald-50/50",
        };
      case "PENDING_VERIFICATION":
        return {
          label: t("paymentStatus.PENDING_VERIFICATION"),
          color: "border-amber-200 text-amber-700 bg-amber-50/50",
        };
      default:
        return { label: status, color: "border-zinc-200 text-zinc-700" };
    }
  };

  // Cooldown timer cleanup
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const startCooldownTimer = () => {
    setCooldown(30);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Actions
  const handleCancelOrder = async () => {
    setIsPending(true);
    try {
      const res = await cancelOrderAction(order.id);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("labels.unknownErrorToast"));
    } finally {
      setIsPending(false);
    }
  };

  const handleApproveOrder = async () => {
    setIsPending(true);
    try {
      const res = await approveB2BOrderAction(order.id);
      if (res.success) {
        toast.success(t("labels.approveSuccessToast"));
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("labels.approveFailedToast"));
    } finally {
      setIsPending(false);
    }
  };

  const handleReVerifyPayment = async () => {
    setIsPending(true);
    try {
      const res = await reVerifyPaymentAction(order.id);
      if (res.success) {
        toast.success(t("labels.verifySuccessToast"));
        router.refresh();
      } else {
        toast.error(res.error);
        startCooldownTimer();
      }
    } catch (error) {
      console.error(error);
      toast.error(t("labels.verifyFailedToast"));
    } finally {
      setIsPending(false);
    }
  };

  const statusInfo = getStatusDetails(order.status);
  const paymentStatusInfo = getPaymentStatusDetails(order.paymentStatus);

  const isB2B =
    currentUser.role === "DEALER_APPROVER" ||
    currentUser.role === "DEALER_PURCHASER";

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
          >
            <Link href="/portal/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
              {t("labels.orderDetails")}
            </h1>
            <p className="text-sm text-zinc-500">
              #{order.id.substring(0, 8)} •{" "}
              {new Date(order.createdAt).toLocaleDateString(
                locale === "vi" ? "vi-VN" : "en-US",
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}
          >
            {statusInfo.label}
          </Badge>
          <Badge
            variant="outline"
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${paymentStatusInfo.color}`}
          >
            {paymentStatusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Progress tracker */}
      <OrderProgress status={order.status} />

      {/* Cancellation Warning Banner */}
      {order.status === "CANCELLATION_REQUESTED" && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h4 className="font-semibold text-amber-900">
              {t("labels.cancellationPendingTitle")}
            </h4>
            <p className="mt-1 text-sm">
              {t("labels.cancellationPendingDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Dealer Approval Banner */}
      <B2BApprovalBanner
        order={order}
        currentUser={currentUser}
        isPending={isPending}
        onApprove={handleApproveOrder}
        onReject={handleCancelOrder}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details Section */}
        <div className="space-y-6 md:col-span-2">
          {/* Order Items Table */}
          <OrderItemsTable items={order.items} />

          {/* Delivery & Billing Address Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <ShippingAddressCard shippingAddress={order.shippingAddress} />
            <BuyerInfoCard user={order.user} isB2B={isB2B} />
          </div>

          {/* Payment Transactions History */}
          <PaymentTransactionsCard transactions={order.paymentTransactions} />
        </div>
        {/* Sidebar Order Summary */}
        <OrderSummarySidebar
          order={order}
          isPending={isPending}
          cooldown={cooldown}
          onReVerifyPayment={handleReVerifyPayment}
          onCancelOrder={handleCancelOrder}
        />
      </div>
    </div>
  );
}
