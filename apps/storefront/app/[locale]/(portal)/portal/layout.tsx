import { getCachedSession } from "@/shared/lib/session";
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
  const session = await getCachedSession();

  if (!session?.user) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent("/portal/profile")}`,
      locale,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-4 md:flex-row">
        <PortalSidebar />
        <main className="min-w-0 flex-1 border-0 bg-white shadow-none md:rounded-xl md:border md:border-zinc-200 md:p-6 md:shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
