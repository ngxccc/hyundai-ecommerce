"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@nhatnang/ui/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Card } from "@nhatnang/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Search, Eye } from "lucide-react";
import { quoteStatusEnum } from "@nhatnang/database/schemas";
import type { QuoteListItem } from "@nhatnang/database/services";
import { formatCurrency } from "@nhatnang/shared/lib/utils";

interface QuoteListProps {
  quotes: QuoteListItem[];
}

export const QuoteList = ({ quotes }: QuoteListProps) => {
  const t = useTranslations("AdminQuotes");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );
  const activeStatus = searchParams.get("status") ?? "all";

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearchTerm !== currentSearch) {
      handleFilterChange("search", debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleFilterChange, searchParams]);

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

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const calculateTotal = (quote: QuoteListItem) => {
    let total = 0;
    for (const line of quote.items) {
      total += parseFloat(line.agreedPrice ?? line.requestedPrice) * line.quantity;
    }
    return total;
  };

  const statuses = ["all", ...quoteStatusEnum.enumValues];

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filters Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="border-border flex flex-wrap gap-1 border-b pb-2 md:border-b-0 md:pb-0">
          {statuses.map((status) => (
            <Button
              key={status}
              variant={activeStatus === status ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange("status", status)}
              className="h-8 text-xs font-medium capitalize"
            >
              {status === "all" ? t("allStatuses") : getStatusLabel(status)}
            </Button>
          ))}
        </div>
      </div>

      {quotes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-lg font-medium">
            {t("noQuotesFound")}
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="border-border bg-card hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">{t("quoteId")}</TableHead>
                  <TableHead className="font-semibold">{t("buyer")}</TableHead>
                  <TableHead className="font-semibold">{t("created")}</TableHead>
                  <TableHead className="font-semibold">{t("totalAmount")}</TableHead>
                  <TableHead className="font-semibold">{t("status")}</TableHead>
                  <TableHead className="text-right font-semibold">{t("action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      #{quote.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{quote.user.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {quote.user.companyName ?? t("noCompany")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(quote.createdAt)}</TableCell>
                    <TableCell className="text-sm font-semibold">
                      {formatCurrency(calculateTotal(quote))}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(quote.status)}>
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/quotes/${quote.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <Eye className="h-4 w-4" />
                          {t("detail")}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards Grid View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {quotes.map((quote) => (
              <Card
                key={quote.id}
                className="border-border bg-card flex flex-col gap-4 border p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-xs font-bold">
                    #{quote.id.slice(0, 8)}...
                  </span>
                  <Badge className={getStatusBadgeClass(quote.status)}>
                    {getStatusLabel(quote.status)}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{quote.user.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {quote.user.companyName ?? t("noCompany")}
                    </span>
                  </div>
                  <span className="text-muted-foreground mt-1 text-xs">
                    {formatDate(quote.createdAt)}
                  </span>
                </div>

                <div className="border-border mt-1 flex items-center justify-between border-t pt-3">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xxs font-semibold tracking-wider uppercase">
                      {t("totalAmount")}
                    </span>
                    <span className="text-primary text-sm font-bold">
                      {formatCurrency(calculateTotal(quote))}
                    </span>
                  </div>
                  <Link href={`/quotes/${quote.id}`}>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {t("detail")}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
