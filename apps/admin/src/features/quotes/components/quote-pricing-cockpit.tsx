"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@nhatnang/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import { Input } from "@nhatnang/ui/components/ui/input";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { Loader2, DollarSign } from "lucide-react";
import type { ComplexQuote } from "@nhatnang/database/services";
import { updateQuoteItemPriceAction } from "../actions";
import {
  formatNumberInput,
  formatCurrency,
  parseNumberInput,
  toIntegerString,
} from "@nhatnang/shared/lib/utils";

interface QuotePricingCockpitProps {
  quote: ComplexQuote;
}

export const QuotePricingCockpit = ({ quote }: QuotePricingCockpitProps) => {
  const t = useTranslations("AdminQuotes");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for the inputs to allow typing freely
  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const item of quote.items) {
      initial[item.id] = item.agreedPrice
        ? formatNumberInput(toIntegerString(item.agreedPrice))
        : "";
    }
    return initial;
  });

  const isFinalized =
    quote.status === "approved" ||
    quote.status === "rejected" ||
    quote.status === "expired";

  const handleInputChange = (itemId: string, val: string) => {
    setInputValues((prev) => ({
      ...prev,
      [itemId]: formatNumberInput(val),
    }));
  };

  const handlePriceUpdate = (itemId: string, savedValue: string | null) => {
    const rawVal = inputValues[itemId];
    if (rawVal === undefined) return;

    // If empty string and there was no agreed price, do nothing
    if (rawVal.trim() === "" && savedValue === null) {
      return;
    }

    const cleanedVal = parseNumberInput(rawVal);

    if (cleanedVal === "") {
      setInputValues((prev) => ({
        ...prev,
        [itemId]: savedValue ? formatNumberInput(toIntegerString(savedValue)) : "",
      }));
      return;
    }

    const savedPriceClean = savedValue ? toIntegerString(savedValue) : null;

    // If value didn't change, do nothing
    if (cleanedVal === savedPriceClean) {
      setInputValues((prev) => ({
        ...prev,
        [itemId]: savedValue ? formatNumberInput(toIntegerString(savedValue)) : "",
      }));
      return;
    }

    startTransition(async () => {
      const decimalVal = parseFloat(cleanedVal).toFixed(2);
      const res = await updateQuoteItemPriceAction(
        quote.id,
        itemId,
        decimalVal,
      );
      if (res.success) {
        toast.success(t("updatePriceSuccess"));
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update price");
        setInputValues((prev) => ({
          ...prev,
          [itemId]: savedValue ? formatNumberInput(toIntegerString(savedValue)) : "",
        }));
      }
    });
  };

  // Totals calculations
  let totalRequestedAmount = 0;
  let totalNegotiatedAmount = 0;

  for (const item of quote.items) {
    const reqPrice = parseFloat(item.requestedPrice);
    totalRequestedAmount += reqPrice * item.quantity;

    const finalPrice = parseFloat(item.agreedPrice ?? item.requestedPrice);
    totalNegotiatedAmount += finalPrice * item.quantity;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          {t("pricingCockpit")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("product")}</TableHead>
                <TableHead className="text-right">{t("quantity")}</TableHead>
                <TableHead className="text-right">{t("retailPrice")}</TableHead>
                <TableHead className="text-right">
                  {t("requestedPrice")}
                </TableHead>
                <TableHead className="w-45 text-right">
                  {t("agreedPrice")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-50 truncate font-medium">
                    {item.product.nameVi}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right font-semibold">
                    {formatCurrency(item.product.price)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-orange-600 dark:text-orange-400">
                    {formatCurrency(item.requestedPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {isFinalized ? (
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {item.agreedPrice
                          ? formatNumberInput(item.agreedPrice)
                          : "—"}
                      </span>
                    ) : (
                      <div className="relative flex items-center">
                        <Input
                          type="text"
                          disabled={isPending}
                          placeholder={item.requestedPrice}
                          value={inputValues[item.id] ?? ""}
                          onChange={(e) =>
                            handleInputChange(item.id, e.target.value)
                          }
                          onBlur={() =>
                            handlePriceUpdate(item.id, item.agreedPrice)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handlePriceUpdate(item.id, item.agreedPrice);
                              e.currentTarget.blur();
                            }
                          }}
                          className="h-9 border-green-200 pr-8 text-right font-semibold focus-visible:ring-green-500"
                        />
                        {isPending && (
                          <div className="text-muted-foreground absolute right-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Box */}
        <div className="bg-muted/40 flex flex-col gap-2 rounded-lg border p-4">
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>{t("totalRequested")}:</span>
            <span className="font-semibold">
              {formatCurrency(totalRequestedAmount)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t pt-2 text-base font-bold">
            <span>{t("totalAmount")}:</span>
            <span className="text-green-600 dark:text-green-400">
              {formatCurrency(totalNegotiatedAmount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
