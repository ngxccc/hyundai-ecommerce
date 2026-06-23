import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { getCachedSession } from "@/shared/lib/session";
import { orderService } from "@nhatnang/database/services";
import { Link, redirect } from "@/i18n/routing";
import { OrderDetail } from "@/features/portal/components/order-detail";
import { Button } from "@nhatnang/ui/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale;
  const orderId = resolvedParams.id;
  setRequestLocale(locale);

  const t = await getTranslations("Checkout");
  const session = await getCachedSession();

  if (!session?.user) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent(`/portal/orders/${orderId}`)}`,
      locale,
    });
    return null;
  }

  const isSelfOnlyRole =
    session.user.role === "CUSTOMER" ||
    session.user.role === "DEALER_PURCHASER";
  const order = await orderService.getComplexOrder(
    orderId,
    isSelfOnlyRole ? session.user.id : undefined,
  );

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-zinc-900">
          {locale === "vi" ? "Không tìm thấy đơn hàng" : "Order Not Found"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {locale === "vi"
            ? "Mã đơn hàng không hợp lệ hoặc bạn không có quyền xem."
            : "The order ID is invalid or you do not have permission to view it."}
        </p>
        <Button asChild className="mt-6 w-full rounded-md py-6 font-bold">
          <Link href="/portal/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToHome")}
          </Link>
        </Button>
      </div>
    );
  }

  // Ownership Check:
  // 1. Current user is the purchaser who placed the order (order.userId === session.user.id)
  // 2. Current user is DEALER_APPROVER and belongs to the same company as the purchaser (order.user.companyName === currentB2BProfile.companyName)
  // 3. Current user is Sales Rep or Super Admin
  const isOwner = order.userId === session.user.id;
  const isInternalAdmin =
    session.user.role === "SUPER_ADMIN" ||
    session.user.role === "SALES_REPRESENTATIVE" ||
    session.user.role === "ACCOUNTANT";

  let isCompanyApprover = false;
  let approverCompany: string | null = null;

  if (session.user.role === "DEALER_APPROVER") {
    isCompanyApprover = order.user.parentId === session.user.id;
    if (isOwner || isCompanyApprover) {
      approverCompany = order.user.companyName;
    }
  }

  if (!isOwner && !isInternalAdmin && !isCompanyApprover) {
    redirect({
      href: "/portal/profile",
      locale,
    });
    return null;
  }

  const currentUser = {
    id: session.user.id,
    role: session.user.role,
    name: session.user.name ?? "",
    companyName: approverCompany,
  };

  return <OrderDetail order={order} currentUser={currentUser} />;
}
