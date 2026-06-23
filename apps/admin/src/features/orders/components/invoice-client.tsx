"use client";

import { useTranslations } from "next-intl";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import type { ComplexOrder } from "@nhatnang/database/services";

interface InvoiceClientProps {
  order: ComplexOrder;
}

export const InvoiceClient = ({ order }: InvoiceClientProps) => {
  const t = useTranslations("AdminOrders");
  const router = useRouter();

  const formatCurrency = (amountStr: string) => {
    const amount = parseFloat(amountStr);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getSubtotal = () => {
    return order.items.reduce((acc, item) => {
      const price = parseFloat(item.unitPrice);
      return acc + price * item.quantity;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 dark:bg-slate-950 dark:text-slate-100">
      {/* Control bar (hidden during print) */}
      <div className="no-print mx-auto mb-4 flex max-w-4xl items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Link href={`/orders/${order.id}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("viewDetail")}
          </Button>
        </Link>

        <Button size="sm" onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          {t("printInvoice")}
        </Button>
      </div>

      {/* Invoice Sheet */}
      <div className="invoice-container mx-auto max-w-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900 print:border-none print:bg-transparent print:p-0 print:shadow-none">
        {/* Style block for print layout */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .invoice-container {
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: transparent !important;
            }
          }
        `,
          }}
        />

        {/* Top Header */}
        <div className="flex flex-col justify-between gap-6 border-b-2 border-slate-900 pb-6 sm:flex-row print:flex-row print:border-slate-900">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white print:text-black">
              {t("companyBrand")}
            </h1>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 print:text-slate-600">
              {t("companyName")}
            </p>
            <p className="text-xxs mt-1 max-w-sm leading-relaxed text-slate-500 print:text-slate-500">
              {t("companyAddress")}
              <br />
              {t("taxId")}: {t("companyTaxId")} | {t("phoneLabel")}{" "}
              {t("companyPhone")}
            </p>
          </div>

          <div className="flex flex-col sm:items-end print:items-end">
            <h2 className="text-xl font-bold tracking-wider text-slate-900 dark:text-slate-200 print:text-black">
              {t("invoiceTitle")}
            </h2>
            <div className="mt-2 flex flex-col text-xs font-medium text-slate-600 sm:items-end dark:text-slate-400 print:items-end print:text-slate-600">
              <span>
                {t("invoiceNo")}{" "}
                <strong className="font-mono text-slate-950 dark:text-white print:text-black">
                  #{order.id.slice(0, 8).toUpperCase()}
                </strong>
              </span>
              <span className="mt-0.5">
                {t("invoiceDate")}{" "}
                <strong className="text-slate-950 dark:text-white print:text-black">
                  {formatDate(order.createdAt)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Billing Info Block */}
        <div className="mt-8 grid grid-cols-1 gap-6 border-b border-slate-200 pb-6 sm:grid-cols-2 print:grid-cols-2 print:border-slate-200">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase print:text-slate-500">
              {t("invoiceBillTo")}
            </h3>
            <div className="flex flex-col gap-1 text-sm font-semibold text-slate-900 dark:text-slate-100 print:text-black">
              <span className="text-base font-extrabold">
                {order.user?.companyName ?? order.user?.name ?? t("unknown")}
              </span>
              {order.user?.companyName && order.user?.name && (
                <span className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-600">
                  {t("attnPrefix")} {order.user.name}
                </span>
              )}
              {order.user?.taxId && (
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400 print:text-slate-600">
                  {t("taxId")}: {order.user.taxId}
                </span>
              )}
              <span className="font-mono text-xs text-slate-600 dark:text-slate-400 print:text-slate-600">
                {t("phoneLabel")} {order.user?.phone || ""}
              </span>
              <span className="font-mono text-xs text-slate-600 dark:text-slate-400 print:text-slate-600">
                {t("emailLabel")} {order.user?.email || ""}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase print:text-slate-500">
              {t("shippingAddress")}
            </h3>
            <p className="text-xs leading-relaxed font-medium whitespace-pre-wrap text-slate-700 dark:text-slate-300 print:text-slate-700">
              {order.shippingAddress}
            </p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mt-8 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 print:border-slate-300">
          <Table className="print:text-black">
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50 print:bg-slate-100">
              <TableRow className="border-slate-200 dark:border-slate-800 print:border-slate-300">
                <TableHead className="w-12 text-center font-bold">
                  {t("invoiceTableNo")}
                </TableHead>
                <TableHead className="font-bold">
                  {t("invoiceDescription")}
                </TableHead>
                <TableHead className="text-center font-bold">
                  {t("invoiceQuantity")}
                </TableHead>
                <TableHead className="text-right font-bold">
                  {t("invoiceUnitPrice")}
                </TableHead>
                <TableHead className="text-right font-bold">
                  {t("invoiceAmount")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, idx) => {
                const price = parseFloat(item.unitPrice);
                const subtotal = price * item.quantity;
                return (
                  <TableRow
                    key={item.id}
                    className="border-slate-200 dark:border-slate-800 print:border-slate-300"
                  >
                    <TableCell className="text-center text-xs font-medium">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 print:text-black">
                          {item.productName}
                        </span>
                        <span className="text-xxs font-mono text-slate-500 print:text-slate-500">
                          SKU: {item.productSku}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold">
                      {formatCurrency(subtotal.toString())}
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Subtotal Row */}
              <TableRow className="border-t border-slate-200 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-800/10 print:border-slate-300">
                <TableCell
                  colSpan={4}
                  className="text-right text-xs font-semibold"
                >
                  {t("invoiceSubtotal")}
                </TableCell>
                <TableCell className="text-right text-xs font-semibold">
                  {formatCurrency(getSubtotal().toString())}
                </TableCell>
              </TableRow>

              {/* Shipping Row */}
              <TableRow className="border-none bg-slate-50/30 dark:bg-slate-800/10">
                <TableCell
                  colSpan={4}
                  className="text-right text-xs font-semibold"
                >
                  {t("invoiceShippingFee")}
                </TableCell>
                <TableCell className="text-right text-xs font-semibold">
                  {formatCurrency(order.shippingFee ?? "0")}
                </TableCell>
              </TableRow>

              {/* Grand Total Row */}
              <TableRow className="border-t-2 border-slate-900 bg-slate-50/50 font-bold dark:border-slate-800 dark:bg-slate-800/20 print:border-slate-900">
                <TableCell colSpan={4} className="text-right text-sm">
                  {t("invoiceTotalPayment")}
                </TableCell>
                <TableCell className="text-right text-sm text-slate-950 dark:text-white print:text-black">
                  {formatCurrency(order.totalAmount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Bottom Signatures Block */}
        <div className="mt-16 grid grid-cols-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-slate-700">
          <div className="flex h-32 flex-col justify-between">
            <span>{t("invoiceBuyerSign")}</span>
            <span className="text-xxs text-slate-400 italic print:text-slate-400">
              {t("invoiceBuyerSignDesc")}
            </span>
          </div>

          <div className="flex h-32 flex-col justify-between">
            <span>{t("invoiceSellerSign")}</span>
            <span className="text-xxs text-slate-400 italic print:text-slate-400">
              {t("invoiceSellerSignDesc")}
            </span>
          </div>
        </div>

        {/* Invoice Footer Thank You Message */}
        <div className="mt-16 border-t border-slate-200 pt-6 text-center text-xs font-medium text-slate-500 dark:border-slate-800 print:border-slate-300 print:text-slate-500">
          <p>{t("invoiceThankYou")}</p>
        </div>
      </div>
    </div>
  );
};
