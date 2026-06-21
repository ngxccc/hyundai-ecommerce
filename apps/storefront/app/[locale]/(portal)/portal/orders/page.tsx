import { setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { getCachedSession } from "@/shared/lib/session";
import { orderService, userService } from "@nhatnang/database/services";
import { redirect } from "@/i18n/routing";
import { OrderList } from "@/features/portal/components/order-list";
import type { ComplexOrder } from "@nhatnang/database/services";

interface OrderListPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    after?: string;
    before?: string;
    companyAfter?: string;
    companyBefore?: string;
    last?: string;
    companyLast?: string;
  }>;
}

export default async function OrderListPage({
  params,
  searchParams,
}: OrderListPageProps) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const session = await getCachedSession();

  if (!session?.user) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent("/portal/orders")}`,
      locale,
    });
    return null;
  }

  const resolvedSearchParams = await searchParams;

  // Fetch current user orders paginated
  const myOrdersResult = await orderService.listUserOrdersPaginated(
    session.user.id,
    10,
    {
      after: resolvedSearchParams.after,
      before: resolvedSearchParams.before,
      last: resolvedSearchParams.last === "true",
    },
  );

  let companyOrders: ComplexOrder[] = [];
  let companyPagination = {
    nextCursor: undefined as string | undefined,
    prevCursor: undefined as string | undefined,
    hasMore: false,
  };
  let companyName: string | null = null;

  // If user is Dealer Approver, fetch pending company orders
  if (session.user.role === "DEALER_APPROVER") {
    const approverProfile = await userService.getB2BProfile(session.user.id);
    if (approverProfile?.companyName) {
      companyName = approverProfile.companyName;

      const companyOrdersResult = await orderService.listCompanyOrdersPaginated(
        companyName,
        10,
        {
          after: resolvedSearchParams.companyAfter,
          before: resolvedSearchParams.companyBefore,
          excludeUserId: session.user.id,
          approvalStatus: "PENDING_APPROVAL",
          last: resolvedSearchParams.companyLast === "true",
        },
      );

      companyOrders = companyOrdersResult.orders;
      companyPagination = {
        nextCursor: companyOrdersResult.nextCursor,
        prevCursor: companyOrdersResult.prevCursor,
        hasMore: companyOrdersResult.hasMore,
      };
    }
  }

  const currentUser = {
    id: session.user.id,
    role: session.user.role,
    name: session.user.name ?? "",
    companyName,
  };

  return (
    <OrderList
      myOrders={myOrdersResult.orders}
      myPagination={{
        nextCursor: myOrdersResult.nextCursor,
        prevCursor: myOrdersResult.prevCursor,
        hasMore: myOrdersResult.hasMore,
      }}
      companyOrders={companyOrders}
      companyPagination={companyPagination}
      currentUser={currentUser}
    />
  );
}
