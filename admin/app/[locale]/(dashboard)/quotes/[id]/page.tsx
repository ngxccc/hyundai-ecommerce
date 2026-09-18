import { Suspense } from "react";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { QuoteHeader } from "@/features/quotes/components";
import { QuotePricingCockpit } from "@/features/quotes/components/quote-pricing-cockpit";
import { quotesApi } from "@/features/quotes/api/quotes.api";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/action-auth";
import { connection } from "next/server";
import type { Metadata } from "next";
import { CenteredSpinner } from "@/components/common";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminQuotes" });

  return {
    title: t("title"),
  };
}

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [tNav, tHeader] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminQuotes"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* 1. Breadcrumbs consistently on top */}
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tHeader("title"), href: "/quotes" },
          { label: tHeader("detail") },
        ]}
      />

      {/* 2. Dynamic content isolated inside Suspense with CenteredSpinner */}
      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <QuoteDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function QuoteDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  await requireAuth();

  const { data: quoteRes } = await quotesApi.getById(id);
  const quote = quoteRes?.data;
  if (!quote) {
    notFound();
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <QuoteHeader quote={quote} />

      <div className="w-full">
        <QuotePricingCockpit quote={quote} />
      </div>
    </div>
  );
}
