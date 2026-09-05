"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  User,
  XCircle,
  Play,
  CheckCircle2,
  ExternalLink,
  Printer,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { QUOTE_STATUS } from "@/shared/constants";
import type { AdminQuote } from "@/types/api";
import {
  updateQuoteStatusAction,
  approveAndConvertToOrderAction,
} from "../actions";

interface QuoteHeaderProps {
  quote: AdminQuote;
}

export const QuoteHeader = ({ quote }: QuoteHeaderProps) => {
  const t = useTranslations("AdminQuotes");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const res = await fetch(`/api/quotes/${quote.id}/excel`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao-Gia-Hyundai-${quote.quoteNumber ?? quote.id.slice(0, 8)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(
        t("exportExcelSuccess" as never) ||
          "Tải file Excel báo giá thành công!",
      );
    } catch {
      toast.error(
        t("exportExcelError" as never) ||
          "Xuất file Excel thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsExportingExcel(false);
    }
  };
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case QUOTE_STATUS.SUBMITTED:
      case "pending_review":
        return "bg-yellow-100 text-yellow-700 border-transparent dark:bg-yellow-900/30 dark:text-yellow-400";
      case QUOTE_STATUS.NEGOTIATING:
      case "negotiating":
        return "bg-blue-100 text-blue-700 border-transparent dark:bg-blue-900/30 dark:text-blue-400";
      case QUOTE_STATUS.APPROVED:
      case "approved":
        return "bg-green-100 text-green-700 border-transparent dark:bg-green-900/30 dark:text-green-400";
      case QUOTE_STATUS.REJECTED:
      case "rejected":
        return "bg-red-100 text-red-700 border-transparent dark:bg-red-900/30 dark:text-red-400";
      case QUOTE_STATUS.EXPIRED:
      case "expired":
        return "bg-gray-100 text-gray-700 border-transparent dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-secondary text-secondary-foreground border-transparent";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case QUOTE_STATUS.SUBMITTED:
      case "pending_review":
        return t("statusPendingReview");
      case QUOTE_STATUS.NEGOTIATING:
      case "negotiating":
        return t("statusNegotiating");
      case QUOTE_STATUS.APPROVED:
      case "approved":
        return t("statusApproved");
      case QUOTE_STATUS.REJECTED:
      case "rejected":
        return t("statusRejected");
      case QUOTE_STATUS.EXPIRED:
      case "expired":
        return t("statusExpired");
      default:
        return status;
    }
  };

  const handleStatusChange = (
    newStatus:
      | "NEGOTIATING"
      | "REJECTED"
      | "EXPIRED"
      | "negotiating"
      | "rejected"
      | "expired",
  ) => {
    startTransition(async () => {
      const res = await updateQuoteStatusAction(quote.id, newStatus);
      if (res.success) {
        toast.success(t("statusChangeSuccess"));
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleApproveAndConvert = () => {
    startTransition(async () => {
      const res = await approveAndConvertToOrderAction(quote.id);
      if (res.success && res.data.orderId) {
        toast.success(t("convertSuccess"));
        router.push(`/orders/${res.data.orderId}`);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Link
            href="/quotes"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToQuotes")}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {t("quoteId")}: #{quote.id.substring(0, 8)}
            </h1>
            <Badge className={getStatusBadgeClass(quote.status)}>
              {getStatusLabel(quote.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {t("created")}:{" "}
            {new Date(quote.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="gap-2 shadow-xs">
            <Link href={`/quotes/${quote.id}/export`}>
              <Printer className="h-4 w-4" />
              In / Xuất PDF
            </Link>
          </Button>

          <Button
            variant="outline"
            className="gap-2 shadow-xs"
            disabled={isExportingExcel}
            onClick={handleExportExcel}
          >
            {isExportingExcel ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            )}
            Xuất Excel (.xlsx)
          </Button>

          {quote.status === QUOTE_STATUS.SUBMITTED && (
            <>
              <Button
                onClick={() => handleStatusChange(QUOTE_STATUS.REJECTED)}
                disabled={isPending}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/10"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t("reject")}
              </Button>
              <Button
                onClick={() => handleStatusChange(QUOTE_STATUS.NEGOTIATING)}
                disabled={isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                {t("startNegotiating")}
              </Button>
            </>
          )}

          {quote.status === QUOTE_STATUS.NEGOTIATING && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusChange(QUOTE_STATUS.REJECTED)}
                disabled={isPending}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/10"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t("reject")}
              </Button>
              <Button
                onClick={handleApproveAndConvert}
                disabled={isPending}
                className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t("approveAndConvert")}
              </Button>
            </>
          )}

          {quote.status === QUOTE_STATUS.APPROVED && quote.orderId && (
            <Button asChild variant="outline">
              <Link href={`/orders/${quote.orderId}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Order #{quote.orderId.substring(0, 8)}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Buyer Details Grid */}
      <Card className="py-0">
        <CardContent className="grid grid-cols-1 gap-6 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <User className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {t("buyer")}
              </p>
              <p className="text-foreground text-sm font-semibold">
                {quote.user?.fullName ?? quote.customerName}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building2 className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {t("buyer")} (B2B Entity)
              </p>
              <p className="text-foreground text-sm font-semibold">
                {quote.companyName ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Email
              </p>
              <p className="text-foreground max-w-50 truncate text-sm font-semibold">
                {quote.user?.email ?? quote.customerEmail ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {t("buyer")} Location
              </p>
              <p className="text-foreground text-sm font-semibold">
                {quote.shippingAddress ?? "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
