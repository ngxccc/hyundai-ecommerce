"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Card, CardContent } from "@nhatnang/ui/components/ui/card";
import { toast } from "@nhatnang/ui/components/ui/sonner";
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
} from "lucide-react";
import type { ComplexQuote } from "@nhatnang/database/services";
import {
  updateQuoteStatusAction,
  approveAndConvertToOrderAction,
} from "../actions";

interface QuoteHeaderProps {
  quote: ComplexQuote;
}

export const QuoteHeader = ({ quote }: QuoteHeaderProps) => {
  const t = useTranslations("AdminQuotes");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending_review":
        return "bg-yellow-100 text-yellow-700 border-transparent dark:bg-yellow-900/30 dark:text-yellow-400";
      case "negotiating":
        return "bg-blue-100 text-blue-700 border-transparent dark:bg-blue-900/30 dark:text-blue-400";
      case "approved":
        return "bg-green-100 text-green-700 border-transparent dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 border-transparent dark:bg-red-900/30 dark:text-red-400";
      case "expired":
        return "bg-gray-100 text-gray-700 border-transparent dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-secondary text-secondary-foreground border-transparent";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_review":
        return t("statusPendingReview");
      case "negotiating":
        return t("statusNegotiating");
      case "approved":
        return t("statusApproved");
      case "rejected":
        return t("statusRejected");
      case "expired":
        return t("statusExpired");
      default:
        return status;
    }
  };

  const handleStatusChange = (
    newStatus: "negotiating" | "rejected" | "expired",
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
      if (res.success && res.data?.orderId) {
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
          {quote.status === "pending_review" && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusChange("rejected")}
                disabled={isPending}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/10"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t("reject")}
              </Button>
              <Button
                onClick={() => handleStatusChange("negotiating")}
                disabled={isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                {t("startNegotiating")}
              </Button>
            </>
          )}

          {quote.status === "negotiating" && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusChange("rejected")}
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

          {quote.status === "approved" && quote.orderId && (
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
                {quote.user.name}
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
                {quote.user.companyName ?? "N/A"}
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
                {quote.user.email}
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
                {quote.user.province ?? "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
