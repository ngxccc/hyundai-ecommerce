"use client";

import { useTranslations } from "next-intl";
import { useFormContext, Controller } from "react-hook-form";
import { Link } from "@/i18n/routing";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Label } from "@nhatnang/ui/components/ui/label";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@nhatnang/ui/components/ui/radio-group";
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Info,
  Banknote,
} from "lucide-react";
import type { CheckoutFormInput } from "./checkout-template";

interface CheckoutPaymentMethodProps {
  isB2B: boolean;
  isCreditLocked: boolean;
  isPurchaser: boolean;
  isSubmitting: boolean;
}

export function CheckoutPaymentMethod({
  isB2B,
  isCreditLocked,
  isPurchaser,
  isSubmitting,
}: CheckoutPaymentMethodProps) {
  const t = useTranslations("Checkout");
  const { control } = useFormContext<CheckoutFormInput>();

  return (
    <Card className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 pt-4! shadow-sm">
      <h2 className="mb-0 border-b pb-4 text-lg font-bold text-zinc-900">
        {t("paymentMethod")}
      </h2>

      {/* Trade Credit Alerts */}
      {isB2B && isCreditLocked && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div className="space-y-1">
            <p className="font-bold">{t("tradeCreditLocked")}</p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-red-300 text-red-800 hover:bg-red-100"
            >
              <Link href="/portal/debt">{t("payDebtCta")}</Link>
            </Button>
          </div>
        </div>
      )}

      {isB2B && !isCreditLocked && isPurchaser && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Info className="mt-0.5 size-5 shrink-0 text-blue-600" />
          <p className="font-medium">{t("purchaserAlert")}</p>
        </div>
      )}

      <Controller
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4"
            disabled={isSubmitting}
          >
            {/* PAYOS */}
            <div>
              <RadioGroupItem
                value="PAYOS"
                id="method_payos"
                className="peer sr-only"
              />
              <Label
                htmlFor="method_payos"
                className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-primary/10 flex h-full min-h-0 cursor-pointer flex-row items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-all peer-data-[state=checked]:ring-1 hover:bg-zinc-50 sm:min-h-28 sm:flex-col sm:justify-center sm:gap-2 sm:p-4 sm:text-center"
              >
                <CreditCard className="mb-0 size-6 shrink-0 text-zinc-400 sm:mb-2" />
                <p className="text-sm font-semibold text-zinc-900">
                  {t("methodPayOS")}
                </p>
              </Label>
            </div>

            {/* CASH */}
            <div>
              <RadioGroupItem
                value="CASH"
                id="method_cash"
                className="peer sr-only"
              />
              <Label
                htmlFor="method_cash"
                className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-primary/10 flex h-full min-h-0 cursor-pointer flex-row items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-all peer-data-[state=checked]:ring-1 hover:bg-zinc-50 sm:min-h-28 sm:flex-col sm:justify-center sm:gap-2 sm:p-4 sm:text-center"
              >
                <Banknote className="mb-0 size-6 shrink-0 text-zinc-400 sm:mb-2" />
                <p className="text-sm font-semibold text-zinc-900">
                  {t("methodCash")}
                </p>
              </Label>
            </div>

            {/* TRADE_CREDIT */}
            {isB2B && (
              <div>
                <RadioGroupItem
                  value="TRADE_CREDIT"
                  id="method_trade_credit"
                  className="peer sr-only"
                  disabled={isCreditLocked}
                />
                <Label
                  htmlFor="method_trade_credit"
                  className={`peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-primary/10 flex h-full min-h-0 cursor-pointer flex-row items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-all peer-data-[state=checked]:ring-1 hover:bg-zinc-50 sm:min-h-28 sm:flex-col sm:justify-center sm:gap-2 sm:p-4 sm:text-center ${
                    isCreditLocked
                      ? "cursor-not-allowed opacity-40 hover:bg-white"
                      : ""
                  }`}
                >
                  <CheckCircle className="mb-0 size-6 shrink-0 text-zinc-400 sm:mb-2" />
                  <p className="text-sm font-semibold text-zinc-900">
                    {t("methodTradeCredit")}
                  </p>
                </Label>
              </div>
            )}
          </RadioGroup>
        )}
      />
    </Card>
  );
}
