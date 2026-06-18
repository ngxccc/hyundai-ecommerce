import { redirect } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { ProfileForm } from "@/features/portal/components/profile-form";
import { getCachedSession } from "@/shared/lib/session";
import { userService } from "@nhatnang/database/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "Portal.profile" });
  return { title: `${t("title")} | Hyundai B2B Storefront` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  const session = await getCachedSession();

  // Layout already guards this; handle edge case defensively
  if (!session?.user) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent("/portal/profile")}`,
      locale,
    });
    return null;
  }

  const dbUser = await userService.getById(session.user.id);
  if (!dbUser) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent("/portal/profile")}`,
      locale,
    });
    return null;
  }

  const t = await getTranslations({ locale, namespace: "Portal.profile" });

  const isDealer =
    dbUser.role === "DEALER_APPROVER" || dbUser.role === "DEALER_PURCHASER";

  return (
    <div>
      <div className="mb-4 border-b border-zinc-100 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          {t("title")}
        </h1>
      </div>

      <ProfileForm
        email={dbUser.email}
        isDealer={isDealer}
        defaultValues={{
          name: dbUser.name,
          phone: dbUser.phone ?? "",
          companyName: dbUser.companyName ?? "",
          taxId: dbUser.taxId ?? "",
          businessType: dbUser.businessType ?? "END_USER",
          province: dbUser.province ?? "",
        }}
      />
    </div>
  );
}
