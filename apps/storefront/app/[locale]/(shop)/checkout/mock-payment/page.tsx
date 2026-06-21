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
  getRecentPendingTransactionsAction,
  simulatePayOSWebhookAction,
  simulatePayOSCancelAction,
  simulatePayOSMismatchAction,
} from "@/features/checkout/actions";
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { priceFormatter } from "@nhatnang/shared/lib/utils";

export default function MockPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderCode = searchParams.get("orderCode");
  const orderId = searchParams.get("orderId");
  const queryIdentifier = orderCode ?? orderId;
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
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<{
    orders: {
      id: string;
      orderCode: string;
      amount: number;
      createdAt: Date;
      paymentMethod: string;
      paymentStatus: string;
      status: string;
    }[];
    repayments: {
      id: string;
      orderCode: string;
      amount: number;
      status: string;
    }[];
  } | null>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  useEffect(() => {
    if (!queryIdentifier) {
      getRecentPendingTransactionsAction()
        .then((res) => {
          if (res.success) {
            setRecentTransactions({
              orders: res.orders,
              repayments: res.repayments,
            });
          } else {
            setError(res.error ?? "Failed to load recent pending transactions");
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "An error occurred");
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    getMockPaymentDetailsAction(queryIdentifier)
      .then((res) => {
        if (res.success) {
          setDetails({
            type: res.type,
            amount: res.amount,
            orderId: res.orderId,
            userId: res.userId,
            orderCode: res.orderCode,
          });
          setCustomAmount(res.amount);
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
  }, [queryIdentifier]);

  const handlePaySuccess = async () => {
    if (!details) return;
    setIsProcessing(true);
    try {
      const isMismatch = customAmount !== details.amount;
      const res = await simulatePayOSWebhookAction(
        details.orderCode,
        customAmount,
        "success",
      );
      if (res.success) {
        toast.success(
          `Mock payment webhook fired for ${priceFormatter.format(customAmount)}!`,
        );
        addLog(
          `Fired webhook for ${priceFormatter.format(customAmount)} (${isMismatch ? "Amount Mismatch" : "Exact Success"})`,
        );

        if (shouldRedirect) {
          setTimeout(() => {
            if (details.type === "order") {
              router.push(`/checkout/success?orderId=${details.orderId}`);
            } else {
              router.push(`/portal/debt?repaymentSuccess=true`);
            }
          }, 1500);
        }
      } else {
        toast.error(res.error ?? "Failed to trigger success webhook");
        addLog(`Failed to trigger webhook: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error triggering success webhook");
      addLog(`Network error triggering webhook`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayMismatch = async () => {
    if (!details) return;
    setIsProcessing(true);
    try {
      const mismatchAmount = details.amount - 1000;
      const res = await simulatePayOSMismatchAction(
        details.orderCode,
        details.amount,
      );
      if (res.success) {
        toast.warning("Mock payment mismatch webhook fired!");
        addLog(
          `Fired mismatch webhook for ${priceFormatter.format(mismatchAmount)} (Underpay)`,
        );

        if (shouldRedirect) {
          setTimeout(() => {
            if (details.type === "order") {
              router.push(`/checkout/success?orderId=${details.orderId}`);
            } else {
              router.push(`/portal/debt?repaymentMismatch=true`);
            }
          }, 1500);
        }
      } else {
        toast.error(res.error ?? "Failed to trigger mismatch webhook");
        addLog(`Failed to trigger mismatch: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error triggering mismatch webhook");
      addLog("Network error triggering mismatch");
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
        addLog("Cancelled transaction action triggered");

        if (shouldRedirect) {
          setTimeout(() => {
            if (details.type === "order") {
              router.push(`/checkout/cancel?orderCode=${details.orderCode}`);
            } else {
              router.push(`/portal/debt?repaymentCancel=true`);
            }
          }, 1500);
        }
      } else {
        toast.error(res.error ?? "Failed to cancel transaction");
        addLog(`Failed to cancel transaction: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error cancelling transaction");
      addLog("Network error cancelling transaction");
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

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-zinc-900">
          Error loading gateway
        </h2>
        <p className="mt-2 text-sm text-zinc-500">{error}</p>
        <Button onClick={() => router.push("/")} className="mt-6 w-full">
          Back to Home
        </Button>
      </div>
    );
  }

  if (!queryIdentifier) {
    return (
      <div className="flex items-center justify-center bg-zinc-50 p-4">
        <Card className="w-full max-w-2xl gap-0 rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <CardHeader className="border-b pb-4 text-center">
            <CardTitle className="text-xl font-bold text-zinc-900">
              PayOS Mock Payment Gateway
            </CardTitle>
            <p className="mt-1 text-xs font-medium tracking-wider text-zinc-400 uppercase">
              Select a Pending Transaction to Test
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">
                Pending Orders ({recentTransactions?.orders.length ?? 0})
              </h3>
              {recentTransactions?.orders &&
              recentTransactions.orders.length > 0 ? (
                <div className="max-h-64 divide-y overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50">
                  {recentTransactions.orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between p-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900">
                          Order #{o.id.substring(0, 8)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Code: {o.orderCode} • {o.paymentMethod} •{" "}
                          {o.paymentStatus}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-zinc-900">
                          {priceFormatter.format(o.amount)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/checkout/mock-payment?orderId=${o.id}`,
                            )
                          }
                          className="h-8 rounded-lg text-xs"
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  No pending PayOS/Cash orders found for this user.
                </p>
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-bold text-zinc-900">
                Pending B2B Repayments (
                {recentTransactions?.repayments.length ?? 0})
              </h3>
              {recentTransactions?.repayments &&
              recentTransactions.repayments.length > 0 ? (
                <div className="max-h-64 divide-y overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50">
                  {recentTransactions.repayments.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900">
                          Repayment #{r.id.substring(0, 8)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Code: {r.orderCode} • Status: {r.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-zinc-900">
                          {priceFormatter.format(r.amount)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/checkout/mock-payment?orderCode=${r.orderCode}`,
                            )
                          }
                          className="h-8 rounded-lg text-xs"
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  No pending repayments found for this user.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t pt-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full rounded-xl"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => router.push("/portal/orders")}
                className="w-full rounded-xl"
              >
                Go to Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!details) return null;

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

          <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500">
                Custom Payment Amount:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customAmount || ""}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <Button
                  variant="outline"
                  onClick={() => setCustomAmount(details.amount)}
                  className="h-9 rounded-lg text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shouldRedirect"
                checked={shouldRedirect}
                onChange={(e) => setShouldRedirect(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="shouldRedirect"
                className="cursor-pointer text-xs font-medium text-zinc-600 select-none"
              >
                Redirect to success/debt page after firing
              </label>
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

          {logs.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <span className="text-xs font-semibold text-zinc-500">
                Activity Logs:
              </span>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border bg-zinc-950 p-3 font-mono text-[10px] text-zinc-400">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
