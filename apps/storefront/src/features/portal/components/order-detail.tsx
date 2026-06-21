"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import type { ComplexOrder } from "@nhatnang/database/services";
import {
  getStatusDetails,
  getPaymentStatusDetails,
} from "./order-status-utils";
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

  const statusInfo = getStatusDetails(order.status, t);
  const paymentStatusInfo = getPaymentStatusDetails(order.paymentStatus, t);

  const isB2B =
    currentUser.role === "DEALER_APPROVER" ||
    currentUser.role === "DEALER_PURCHASER";

  return (
    <div className="mb-6 space-y-6 sm:mb-0">
      {/* Back button and page title */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Back button and Page Title */}
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
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
            {t("labels.orderDetails")}
          </h1>
        </div>

        {/* Row 2: Metadata and Badges */}
        <div className="flex flex-wrap items-center justify-start gap-3">
          <p className="text-sm text-zinc-500">
            #{order.id.substring(0, 8)} •{" "}
            {new Date(order.createdAt).toLocaleDateString(
              locale === "vi" ? "vi-VN" : "en-US",
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
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

      <div className="w-full space-y-6 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
        {/* Main Details Section */}
        <div className="space-y-6 md:col-span-2">
          {/* Mobile-only Action widgets container */}
          <div className="block md:hidden">
            <OrderSummarySidebar
              order={order}
              isPending={isPending}
              cooldown={cooldown}
              onReVerifyPayment={handleReVerifyPayment}
              onCancelOrder={handleCancelOrder}
              variant="actions"
            />
          </div>

          {/* Order Items Table */}
          <OrderItemsTable items={order.items} />

          {/* Delivery & Billing Address Info */}
          <div className="w-full space-y-6 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
            <ShippingAddressCard shippingAddress={order.shippingAddress} />
            <BuyerInfoCard user={order.user} isB2B={isB2B} />
          </div>

          {/* Payment Transactions History */}
          <PaymentTransactionsCard transactions={order.paymentTransactions} />

          {/* Mobile-only Price Summary */}
          <div className="block md:hidden">
            <OrderSummarySidebar
              order={order}
              isPending={isPending}
              cooldown={cooldown}
              onReVerifyPayment={handleReVerifyPayment}
              onCancelOrder={handleCancelOrder}
              variant="summary"
            />
          </div>
        </div>
        {/* Sidebar Order Summary */}
        <div className="hidden md:block">
          <OrderSummarySidebar
            order={order}
            isPending={isPending}
            cooldown={cooldown}
            onReVerifyPayment={handleReVerifyPayment}
            onCancelOrder={handleCancelOrder}
            variant="all"
          />
        </div>
      </div>
    </div>
  );
}
