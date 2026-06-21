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
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">
                {t("labels.transactionId")}
              </TableHead>
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
                  <TableCell
                    className="max-w-30 truncate font-mono text-xs text-zinc-500"
                    title={tx.referenceCode ?? undefined}
                  >
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
      </div>

      {/* Mobile Card List View */}
      <div className="block divide-y divide-zinc-100 md:hidden">
        {transactions.map((tx) => {
          const amount = parseFloat(tx.amount);
          return (
            <div key={tx.id} className="space-y-2.5 p-4">
              {/* Row 1: Tx ID & Status */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-zinc-700">
                  #{tx.id.substring(0, 8)}
                </span>
                {getStatusBadge(tx.status)}
              </div>

              {/* Row 2: Method & Type & Amount */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1 text-xs text-zinc-500">
                  <p className="font-medium text-zinc-800">
                    {getTypeLabel(tx.transactionType)} •{" "}
                    {getMethodLabel(tx.paymentMethod)}
                  </p>
                  <p>
                    {new Date(tx.createdAt).toLocaleString(
                      locale === "vi" ? "vi-VN" : "en-US",
                    )}
                  </p>
                  {tx.referenceCode && (
                    <p
                      className="inline-block max-w-37.5 truncate rounded border border-zinc-100 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px]"
                      title={tx.referenceCode}
                    >
                      Ref: {tx.referenceCode}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-zinc-900">
                    {priceFormatter.format(amount)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
