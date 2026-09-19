import { Suspense } from "react";
import { QuotePrintDocument } from "@/features/quotes/components";
import { quotesApi } from "@/features/quotes/api/quotes.api";
import { companySettingsApi } from "@/features/settings/api/company-settings.api";
import { requireAuth } from "@/lib/action-auth";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Building2, Settings } from "lucide-react";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CenteredSpinner } from "@/components/common";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({
    locale,
    namespace: "adminQuotes.printDocument",
  });
  const shortId = id.length > 8 ? id.slice(0, 8) : id;

  return {
    title: `${t("pageTitle")} #${shortId}`,
  };
}

export default function AdminQuoteExportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  return (
    <Suspense fallback={<CenteredSpinner variant="content" />}>
      <QuoteExportContent params={params} />
    </Suspense>
  );
}

async function QuoteExportContent({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  await connection();
  const { id } = await params;
  await requireAuth();
  const t = await getTranslations("adminQuotes.printDocument");
  let quote;
  let company;

  try {
    const [{ data: quoteRes }, { data: companyRes }] = await Promise.all([
      quotesApi.getById(id),
      companySettingsApi.get(),
    ]);
    quote = quoteRes?.data;
    company = companyRes?.data;
  } catch (err) {
    console.error("[QuoteExportContent] Backend fetch error:", err);
  }

  if (!quote) {
    notFound();
  }

  if (!company) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <Building2 className="mx-auto h-12 w-12 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-bold">{t("noCompanyTitle")}</h2>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {t("noCompanyDescription")}
          </p>
          <Button
            asChild
            className="gap-2 bg-amber-600 text-white hover:bg-amber-700"
          >
            <Link href="/settings/company">
              <Settings className="h-4 w-4" />
              {t("configureCompanyBtn")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <QuotePrintDocument quote={quote} company={company} />;
}
