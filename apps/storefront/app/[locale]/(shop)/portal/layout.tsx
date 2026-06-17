import { headers } from "next/headers";
import { auth } from "@nhatnang/database/auth";
import { PortalSidebar } from "@/features/portal/components/portal-sidebar";
import { redirect } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({
    locale,
    namespace: "Metadata",
  });
  return {
    title: `${t("portalTitle")} | Hyundai B2B Storefront`,
    description: t("portalDescription"),
  };
}

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent("/portal/profile")}`,
      locale,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <PortalSidebar />
        <main className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
