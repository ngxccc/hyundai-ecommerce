"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@nhatnang/ui/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nhatnang/ui/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import type { ComplexOrder } from "@nhatnang/database/services";
import type { UserRole } from "@nhatnang/database/schemas";
import { OrdersTable } from "./orders-table";
import { OrdersMobileList } from "./orders-mobile-list";
import { OrderPagination } from "./order-pagination";

interface OrderListProps {
  myOrders: ComplexOrder[];
  myPagination: {
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
    hasMore: boolean;
  };
  companyOrders: ComplexOrder[];
  companyPagination: {
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
    hasMore: boolean;
  };
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    companyName?: string | null;
  };
}

export function OrderList({
  myOrders,
  myPagination,
  companyOrders,
  companyPagination,
  currentUser,
}: OrderListProps) {
  const [activeTab, setActiveTab] = useState("my-orders");
  const t = useTranslations("Orders");

  const isApprover = currentUser.role === "DEALER_APPROVER";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
          {t("labels.orderHistory")}
        </h1>
        <p className="text-sm text-zinc-500">{t("labels.orderHistoryDesc")}</p>
      </div>

      {isApprover ? (
        <Tabs
          defaultValue="my-orders"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-100 grid-cols-2">
            <TabsTrigger value="my-orders">{t("labels.myOrders")}</TabsTrigger>
            <TabsTrigger value="pending-approval" className="relative">
              {t("labels.pendingApprovalTab")}
              {companyOrders.length > 0 && (
                <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {companyOrders.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-orders" className="m-0">
            {/* Desktop View */}
            <div className="hidden md:block">
              <Card className="overflow-hidden rounded-xl border border-zinc-200 py-0 shadow-sm">
                <CardContent className="p-0">
                  <OrdersTable orders={myOrders} />
                  <OrderPagination
                    type="my"
                    nextCursor={myPagination.nextCursor}
                    prevCursor={myPagination.prevCursor}
                    hasMore={myPagination.hasMore}
                  />
                </CardContent>
              </Card>
            </div>
            {/* Mobile View */}
            <div className="block space-y-4 md:hidden">
              <OrdersMobileList orders={myOrders} />
              <OrderPagination
                type="my"
                nextCursor={myPagination.nextCursor}
                prevCursor={myPagination.prevCursor}
                hasMore={myPagination.hasMore}
              />
            </div>
          </TabsContent>

          <TabsContent value="pending-approval" className="m-0">
            {companyOrders.length > 0 && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-xs leading-relaxed text-amber-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p>
                  {t("labels.pendingApprovalDesc", {
                    companyName: currentUser.companyName ?? "",
                  })}
                </p>
              </div>
            )}
            {/* Desktop View */}
            <div className="hidden md:block">
              <Card className="overflow-hidden rounded-xl border border-zinc-200 py-0 shadow-sm">
                <CardContent className="p-0">
                  <OrdersTable orders={companyOrders} />
                  <OrderPagination
                    type="company"
                    nextCursor={companyPagination.nextCursor}
                    prevCursor={companyPagination.prevCursor}
                    hasMore={companyPagination.hasMore}
                  />
                </CardContent>
              </Card>
            </div>
            {/* Mobile View */}
            <div className="block space-y-4 md:hidden">
              <OrdersMobileList orders={companyOrders} />
              <OrderPagination
                type="company"
                nextCursor={companyPagination.nextCursor}
                prevCursor={companyPagination.prevCursor}
                hasMore={companyPagination.hasMore}
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block">
            <Card className="overflow-hidden rounded-xl border border-zinc-200 py-0 shadow-sm">
              <CardContent className="p-0">
                <OrdersTable orders={myOrders} />
                <OrderPagination
                  type="my"
                  nextCursor={myPagination.nextCursor}
                  prevCursor={myPagination.prevCursor}
                  hasMore={myPagination.hasMore}
                />
              </CardContent>
            </Card>
          </div>
          {/* Mobile View */}
          <div className="block space-y-4 md:hidden">
            <OrdersMobileList orders={myOrders} />
            <OrderPagination
              type="my"
              nextCursor={myPagination.nextCursor}
              prevCursor={myPagination.prevCursor}
              hasMore={myPagination.hasMore}
            />
          </div>
        </>
      )}
    </div>
  );
}
