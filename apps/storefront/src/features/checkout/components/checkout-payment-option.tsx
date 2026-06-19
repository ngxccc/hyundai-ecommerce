"use client";

import { useTranslations } from "next-intl";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Label } from "@nhatnang/ui/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@nhatnang/ui/components/ui/radio-group";
import { priceFormatter } from "@nhatnang/shared/lib/utils";
import type { CheckoutFormInput } from "./checkout-template";

interface CheckoutPaymentOptionProps {
  isSubmitting: boolean;
  totalAmount: number;
  depositAmount: number;
}

export function CheckoutPaymentOption({
  isSubmitting,
  totalAmount,
  depositAmount,
}: CheckoutPaymentOptionProps) {
  const t = useTranslations("Checkout");
  const { control } = useFormContext<CheckoutFormInput>();
  const selectedPaymentMethod = useWatch({
    control,
    name: "paymentMethod",
  });

  if (selectedPaymentMethod === "TRADE_CREDIT") {
    return null;
  }

  return (
    <Card className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 pt-4 shadow-sm">
      <h2 className="mb-0 border-b pb-4 text-lg font-bold text-zinc-900">
        {t("paymentOption")}
      </h2>
      <Controller
        control={control}
        name="paymentOption"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            disabled={isSubmitting}
          >
            <div>
              <RadioGroupItem
                value="FULL"
                id="option_full"
                className="peer sr-only"
              />
              <Label
                htmlFor="option_full"
                className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-primary/10 flex cursor-pointer flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all peer-data-[state=checked]:ring-1 hover:bg-zinc-50"
              >
                <p className="font-bold text-zinc-900">
                  {selectedPaymentMethod === "CASH"
                    ? t("optionFullCash")
                    : t("optionFull")}
                </p>
                <p className="text-primary mt-1 text-base font-extrabold">
                  {priceFormatter.format(totalAmount)}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {selectedPaymentMethod === "CASH"
                    ? t("optionFullCashDesc")
                    : t("optionFullDesc")}
                </p>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="DEPOSIT"
                id="option_deposit"
                className="peer sr-only"
              />
              <Label
                htmlFor="option_deposit"
                className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-primary/10 flex cursor-pointer flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all peer-data-[state=checked]:ring-1 hover:bg-zinc-50"
              >
                <p className="font-bold text-zinc-900">
                  {selectedPaymentMethod === "CASH"
                    ? t("optionDepositCash")
                    : t("optionDeposit")}
                </p>
                <p className="text-primary mt-1 text-base font-extrabold">
                  {priceFormatter.format(depositAmount)}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {selectedPaymentMethod === "CASH"
                    ? t("optionDepositCashDesc")
                    : t("optionDepositDesc")}
                </p>
              </Label>
            </div>
          </RadioGroup>
        )}
      />
    </Card>
  );
}
