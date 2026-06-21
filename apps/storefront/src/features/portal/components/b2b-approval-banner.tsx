"use client";

import { useTranslations } from "next-intl";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Card, CardContent } from "@nhatnang/ui/components/ui/card";
import { Clock, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@nhatnang/ui/components/ui/alert-dialog";
import type { ComplexOrder } from "@nhatnang/database/services";
import type { UserRole } from "@nhatnang/database/schemas";

interface B2BApprovalBannerProps {
  order: ComplexOrder;
  currentUser: {
    role: UserRole;
  };
  isPending: boolean;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

export function B2BApprovalBanner({
  order,
  currentUser,
  isPending,
  onApprove,
  onReject,
}: B2BApprovalBannerProps) {
  const t = useTranslations("Orders");

  if (order.approvalStatus !== "PENDING_APPROVAL") {
    return null;
  }

  return (
    <Card className="border-rose-200 bg-rose-50/30">
      <CardContent className="flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-rose-600" />
          <div>
            <h4 className="font-bold text-rose-900">
              {t("labels.approvalPendingTitle")}
            </h4>
            <p className="text-sm text-rose-700">
              {currentUser.role === "DEALER_APPROVER"
                ? t("labels.approvalPendingDescApprover")
                : t("labels.approvalPendingDescPurchaser")}
            </p>
          </div>
        </div>
        {currentUser.role === "DEALER_APPROVER" && (
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Button
              onClick={onApprove}
              disabled={isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 sm:flex-none"
            >
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("labels.approve")}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isPending}
                  className="flex-1 text-rose-600 hover:bg-rose-50 sm:flex-none"
                >
                  {t("labels.reject")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("labels.rejectConfirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("labels.rejectConfirmDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t("labels.cancelLabel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onReject}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    {t("labels.confirmRejectLabel")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
