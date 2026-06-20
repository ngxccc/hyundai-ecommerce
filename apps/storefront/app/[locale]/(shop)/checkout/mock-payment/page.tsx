"use client";

import { useEffect, useState } from "react";
import { useSearchParams, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import {
  getMockPaymentDetailsAction,
  simulatePayOSWebhookAction,
  simulatePayOSCancelAction,
  simulatePayOSMismatchAction,
} from "@/features/checkout/actions/payment.action";
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { priceFormatter } from "@nhatnang/shared/lib/utils";

export default function MockPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderCode = searchParams.get("orderCode");
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [details, setDetails] = useState<{
    type: "order" | "debt";
    amount: number;
    orderId?: string | undefined;
    userId?: string | undefined;
    orderCode: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderCode) return;

    getMockPaymentDetailsAction(orderCode)
      .then((res) => {
        if (res.success) {
          setDetails({
            type: res.type,
            amount: res.amount,
            orderId: res.orderId,
            userId: res.userId,
            orderCode: res.orderCode,
          });
        } else {
          setError(res.error ?? "Failed to load transaction details");
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "An error occurred");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderCode]);

  const handlePaySuccess = async () => {
    if (!details) return;
    setIsProcessing(true);
    try {
      const res = await simulatePayOSWebhookAction(
        details.orderCode,
        details.amount,
        "success",
      );
      if (res.success) {
        toast.success("Mock payment success webhook fired!");
        setTimeout(() => {
          if (details.type === "order") {
            router.push(`/checkout/success?orderId=${details.orderId}`);
          } else {
            router.push(`/portal/debt?repaymentSuccess=true`);
          }
        }, 1500);
      } else {
        toast.error(res.error ?? "Failed to trigger success webhook");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error triggering success webhook");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayMismatch = async () => {
    if (!details) return;
    setIsProcessing(true);
    try {
      const res = await simulatePayOSMismatchAction(
        details.orderCode,
        details.amount,
      );
      if (res.success) {
        toast.warning("Mock payment mismatch webhook fired!");
        setTimeout(() => {
          if (details.type === "order") {
            router.push(`/checkout/success?orderId=${details.orderId}`);
          } else {
            router.push(`/portal/debt?repaymentMismatch=true`);
          }
        }, 1500);
      } else {
        toast.error(res.error ?? "Failed to trigger mismatch webhook");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error triggering mismatch webhook");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!details) return;
    setIsProcessing(true);
    try {
      const res = await simulatePayOSCancelAction(details.orderCode);
      if (res.success) {
        toast.info("Mock payment cancelled!");
        setTimeout(() => {
          if (details.type === "order") {
            router.push(`/checkout/cancel?orderCode=${details.orderCode}`);
          } else {
            router.push(`/portal/debt?repaymentCancel=true`);
          }
        }, 1500);
      } else {
        toast.error(res.error ?? "Failed to cancel transaction");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error cancelling transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-sm font-medium text-zinc-500">
          Loading mock payment gateway...
        </p>
      </div>
    );
  }

  if (!orderCode || error || !details) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-zinc-900">
          Error loading gateway
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {!orderCode
            ? "Missing orderCode parameter"
            : (error ?? "Invalid transaction details")}
        </p>
        <Button onClick={() => router.push("/")} className="mt-6 w-full">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md gap-0 rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <CardHeader className="border-b pb-4 text-center">
          <CardTitle className="text-xl font-bold text-zinc-900">
            PayOS Mock Payment Gateway
          </CardTitle>
          <p className="mt-1 text-xs font-medium tracking-wider text-zinc-400 uppercase">
            Local Developer Simulation
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4 rounded-xl border bg-zinc-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Transaction Type:</span>
              <span className="font-semibold text-zinc-900 capitalize">
                {details.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Order Code:</span>
              <span className="font-mono font-semibold text-zinc-900">
                {details.orderCode}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold text-zinc-500">Amount to Pay:</span>
              <span className="text-primary text-base font-extrabold">
                {priceFormatter.format(details.amount)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handlePaySuccess}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-6 font-semibold text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-5 w-5" />
              Pay Successfully (Webhook)
            </Button>

            <Button
              onClick={handlePayMismatch}
              disabled={isProcessing}
              variant="outline"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-amber-300 py-6 font-semibold text-amber-800 hover:bg-amber-50"
            >
              <AlertTriangle className="h-5 w-5" />
              Simulate Amount Mismatch (Underpay)
            </Button>

            <Button
              onClick={handleCancel}
              disabled={isProcessing}
              variant="destructive"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-6 font-semibold"
            >
              <XCircle className="h-5 w-5" />
              Cancel & Return
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
