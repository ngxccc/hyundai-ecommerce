import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { QuoteComposer } from "@/features/quotes/components";
import { requireAuth } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({
    locale,
    namespace: "adminQuotes.composer",
  });
  return {
    title: t("pageTitle"),
  };
}

export default async function AdminNewQuotePage() {
  await requireAuth();

  const tNav = await getTranslations("adminDashboard.nav");
  const t = await getTranslations("adminQuotes.composer");

  return (
    <>
      <BrandHeader
        title={t("headerTitle")}
        description={t("headerDescription")}
        showAddButton={false}
      />
      <div className="mx-auto flex w-full flex-col gap-6 p-4">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("quotes"), href: "/quotes" },
            { label: t("breadcrumbNew") },
          ]}
        />

        <QuoteComposer />
      </div>
    </>
  );
}
