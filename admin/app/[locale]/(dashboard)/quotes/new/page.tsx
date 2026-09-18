import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import type { Metadata } from "next";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { QuoteComposer } from "@/features/quotes/components/quote-composer";
import { CenteredSpinner } from "@/components/common";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminQuotes" });

  return {
    title: t("composer.pageTitle"),
  };
}

export default async function NewQuotePage() {
  const [tNav, tQuotes] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminQuotes"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("quotes"), href: "/quotes" },
          { label: tQuotes("composer.breadcrumbNew") },
        ]}
      />

      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {tQuotes("composer.headerTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {tQuotes("composer.headerDescription")}
        </p>
      </div>

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <QuoteComposer />
      </Suspense>
    </div>
  );
}
