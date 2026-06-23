import { redirect } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { EmployeesView } from "@/features/portal/components/employees-view";
import { getCachedSession } from "@/shared/lib/session";
import { userService } from "@nhatnang/database/services";
import { cacheLife, cacheTag } from "next/cache";

async function getCachedEmployees(ownerId: string) {
  "use cache: private";
  cacheLife("days");
  cacheTag(`employees-${ownerId}`);
  return await userService.listEmployees(ownerId);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "Portal.employees" });
  return { title: `${t("title")}` };
}

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  const session = await getCachedSession();

  // Guard: require authenticated user
  if (!session?.user) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent("/portal/employees")}`,
      locale,
    });
    return null;
  }

  // Guard: require DEALER_APPROVER role
  if (session.user.role !== "DEALER_APPROVER") {
    redirect({
      href: "/portal/profile",
      locale,
    });
    return null;
  }

  const employees = await getCachedEmployees(session.user.id);
  const t = await getTranslations({ locale, namespace: "Portal.employees" });

  return (
    <div>
      <div className="mb-4 border-b border-zinc-100 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          {t("title")}
        </h1>
      </div>

      <EmployeesView initialEmployees={employees} />
    </div>
  );
}
