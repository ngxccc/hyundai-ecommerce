import { getCachedSession } from "@/shared/lib/session";
import { userService } from "@nhatnang/database/services";
import { redirect } from "@/i18n/routing";
import { DebtRepayment } from "@/features/portal/components/debt-repayment";
import type { Locale } from "next-intl";

export default async function DebtRepaymentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  const session = await getCachedSession();

  if (!session?.user) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent("/portal/debt")}`,
      locale,
    });
    return null;
  }

  const user = await userService.getB2BProfile(session.user.id);
  if (
    !user ||
    (user.role !== "DEALER_APPROVER" && user.role !== "DEALER_PURCHASER")
  ) {
    redirect({
      href: "/portal/profile",
      locale,
    });
    return null;
  }

  const creditLimit = parseFloat(user.creditLimit || "0");
  const currentDebt = parseFloat(user.currentDebt || "0");

  return (
    <DebtRepayment
      creditLimit={creditLimit}
      currentDebt={currentDebt}
      userName={user.name}
    />
  );
}
