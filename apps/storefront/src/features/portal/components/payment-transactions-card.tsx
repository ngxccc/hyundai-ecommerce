"use client";

import { useLocale, useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";
import { SectionCard } from "./section-card";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import type { ComplexOrder } from "@nhatnang/database/services";
import { priceFormatter } from "@nhatnang/shared/lib/utils";

interface PaymentTransactionsCardProps {
  transactions: ComplexOrder["paymentTransactions"];
}

export function PaymentTransactionsCard({
  transactions,
}: PaymentTransactionsCardProps) {
  const t = useTranslations("Orders");
  const locale = useLocale();

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "PAYOS":
        return t("paymentMethods.PAYOS");
      case "CASH":
        return t("paymentMethods.CASH");
      case "TRADE_CREDIT":
        return t("paymentMethods.TRADE_CREDIT");
      default:
        return method;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return t("transactionTypes.DEPOSIT");
      case "REMAINDER":
        return t("transactionTypes.REMAINDER");
      case "FULL":
        return t("transactionTypes.FULL");
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            {t("transactionStatuses.PENDING")}
          </Badge>
        );
      case "SUCCESS":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            {t("transactionStatuses.SUCCESS")}
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
            {t("transactionStatuses.FAILED")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <SectionCard
        title={t("labels.paymentTransactions")}
        icon={<CreditCard className="h-4 w-4 text-zinc-500" />}
        titleClassName="text-sm font-semibold"
        contentClassName="p-6 text-center text-sm text-zinc-500"
      >
        {t("labels.noTransactions")}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={t("labels.paymentTransactions")}
      icon={<CreditCard className="h-4 w-4 text-zinc-500" />}
      titleClassName="text-sm font-semibold"
      contentClassName="p-0 [&_[data-slot=table-container]]:[scrollbar-width:none] [&_[data-slot=table-container]::-webkit-scrollbar]:hidden"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">{t("labels.transactionId")}</TableHead>
            <TableHead>{t("labels.date")}</TableHead>
            <TableHead>{t("labels.method")}</TableHead>
            <TableHead>{t("labels.status")}</TableHead>
            <TableHead>{t("labels.referenceCode")}</TableHead>
            <TableHead className="pr-6 text-right">
              {t("labels.amount")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const amount = parseFloat(tx.amount);
            return (
              <TableRow key={tx.id}>
                <TableCell className="pl-6 font-medium text-zinc-900">
                  <p className="font-mono text-xs text-zinc-600">
                    #{tx.id.substring(0, 8)}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {getTypeLabel(tx.transactionType)}
                  </p>
                </TableCell>
                <TableCell className="text-xs text-zinc-600">
                  {new Date(tx.createdAt).toLocaleString(
                    locale === "vi" ? "vi-VN" : "en-US",
                  )}
                </TableCell>
                <TableCell className="text-xs font-medium text-zinc-700">
                  {getMethodLabel(tx.paymentMethod)}
                </TableCell>
                <TableCell>{getStatusBadge(tx.status)}</TableCell>
                <TableCell className="font-mono text-xs text-zinc-500">
                  {tx.referenceCode ?? "-"}
                </TableCell>
                <TableCell className="pr-6 text-right font-semibold text-zinc-900">
                  {priceFormatter.format(amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
