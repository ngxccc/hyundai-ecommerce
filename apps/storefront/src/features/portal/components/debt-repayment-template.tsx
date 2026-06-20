"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Label } from "@nhatnang/ui/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@nhatnang/ui/components/ui/radio-group";
import { CreditCard, Landmark, Check } from "lucide-react";
import { generateRepaymentLinkAction } from "../actions/repayment.action";
import { priceFormatter } from "@nhatnang/shared/lib/utils";
import type { PaymentMethod } from "@nhatnang/database/schemas";

interface DebtRepaymentTemplateProps {
  creditLimit: number;
  currentDebt: number;
  userName: string;
}

export function DebtRepaymentTemplate({
  creditLimit,
  currentDebt,
  userName,
}: DebtRepaymentTemplateProps) {
  const t = useTranslations("Portal.debt");
  const te = useTranslations("errors");
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("repaymentSuccess");
    const cancel = searchParams.get("repaymentCancel");
    const mismatch = searchParams.get("repaymentMismatch");

    if (success === "true") {
      toast.success(t("repaymentSuccessMsg"));
    } else if (cancel === "true") {
      toast.error(t("repaymentCancelMsg"));
    } else if (mismatch === "true") {
      toast.warning(t("repaymentMismatchMsg"));
    }
  }, [searchParams, t]);

  const [amount, setAmount] = useState<number>(currentDebt);
  const [paymentMethod, setPaymentMethod] =
    useState<Exclude<PaymentMethod, "TRADE_CREDIT">>("PAYOS");
  const [isLoading, setIsLoading] = useState(false);
  const [showCashInstructions, setShowCashInstructions] = useState(false);

  const availableCredit = Math.max(0, creditLimit - currentDebt);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (amount <= 0 || amount > currentDebt) {
      toast.error(te("invalidAmount"));
      return;
    }

    if (paymentMethod === "CASH") {
      setShowCashInstructions(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateRepaymentLinkAction(amount);
      if (result.success) {
        toast.success(
          t("linkGeneratedSuccess") ||
            "Repayment link generated. Redirecting...",
        );
        window.location.assign(result.checkoutUrl);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error(te("paymentGatewayConnectionFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-zinc-900">
          {t("title") || "B2B Debt Repayment"}
        </h2>
        <p className="text-sm text-zinc-500">
          {t("subtitle") ||
            "Manage outstanding net-term invoices & repay balance."}
        </p>
      </div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            {t("creditLimit") || "Credit Limit"}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-zinc-900">
            {priceFormatter.format(creditLimit)}
          </p>
        </Card>
        <Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            {t("outstandingDebt") || "Outstanding Debt"}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-red-600">
            {priceFormatter.format(currentDebt)}
          </p>
        </Card>
        <Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            {t("availableCredit") || "Available Credit"}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-green-600">
            {priceFormatter.format(availableCredit)}
          </p>
        </Card>
      </div>

      {currentDebt === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="size-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">
            {t("noDebtTitle") || "All Paid Up!"}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {t("noDebtDesc") ||
              "Your account has no outstanding debt. Thank you!"}
          </p>
        </div>
      ) : showCashInstructions ? (
        <Card className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-zinc-900">
            {t("cashInstructionsTitle") || "Office Payment Instructions"}
          </h3>
          <div className="space-y-3 text-sm text-zinc-600">
            <p>
              {t("cashInstructionsDesc1") ||
                "Vui lòng mang số tiền mặt tương ứng đến văn phòng giao dịch của Hyundai Ecommerce để hoàn tất thanh toán."}
            </p>
            <div className="space-y-2 rounded-lg border bg-white p-4">
              <p className="font-semibold text-zinc-900">
                {t("repaymentAmount") || "Repayment Amount"}:{" "}
                <span className="font-extrabold text-red-600">
                  {priceFormatter.format(amount)}
                </span>
              </p>
              <p>
                {t("payer") || "Payer"}:{" "}
                <span className="font-medium text-zinc-800">{userName}</span>
              </p>
            </div>
            <p>
              {t("cashInstructionsDesc2") ||
                "Sau khi nhận tiền mặt, Kế toán viên của chúng tôi sẽ xác nhận trực tiếp trên hệ thống và tự động mở khóa hạn mức tín dụng của bạn ngay lập tức."}
            </p>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCashInstructions(false)}
            >
              {t("back") || "Back"}
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repayment Amount */}
          <div className="space-y-2">
            <Label
              htmlFor="repaymentAmount"
              className="text-sm font-semibold text-zinc-700"
            >
              {t("enterAmount") || "Repayment Amount (VND)"}
            </Label>
            <div className="flex gap-2">
              <Input
                id="repaymentAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={currentDebt}
                min={1000}
                required
                disabled={isLoading}
                className="max-w-md"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setAmount(currentDebt)}
                disabled={isLoading}
              >
                {t("payAll") || "Pay Full Balance"}
              </Button>
            </div>
            <p className="text-xs text-zinc-500">
              {t("amountNote") ||
                "Enter a custom amount or pay the full outstanding balance."}
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-zinc-700">
              {t("selectMethod") || "Payment Method"}
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val: typeof paymentMethod) =>
                setPaymentMethod(val)
              }
              className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2"
              disabled={isLoading}
            >
              <div>
                <RadioGroupItem
                  value="PAYOS"
                  id="PAYOS"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="PAYOS"
                  className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-primary/10 flex cursor-pointer flex-row items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all peer-data-[state=checked]:ring-1 hover:bg-zinc-50"
                >
                  <CreditCard className="size-5 text-zinc-400" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-900">
                      {t("methodPayOS") || "VietQR (PayOS)"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t("methodPayOSDesc") ||
                        "Thanh toán trực tuyến 24/7 qua QR code ngân hàng."}
                    </p>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="CASH"
                  id="CASH"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="CASH"
                  className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-primary/10 flex cursor-pointer flex-row items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all peer-data-[state=checked]:ring-1 hover:bg-zinc-50"
                >
                  <Landmark className="size-5 text-zinc-400" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-900">
                      {t("methodCash") || "CASH"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t("methodCashDesc") ||
                        "Nộp tiền mặt trực tiếp tại văn phòng đại lý."}
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end border-t pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/95 min-w-32"
            >
              {isLoading
                ? t("processing") || "Processing..."
                : t("submitRepayment") || "Thanh toán ngay"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
