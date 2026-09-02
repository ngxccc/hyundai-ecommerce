import { QuotePrintDocument } from "@/features/quotes/components";
import { quotesService } from "@nhatnang/database/services";
import { requireAuth } from "@/shared/lib/action-auth";
import { notFound } from "next/navigation";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminQuotes" });
  const translate = t as unknown as (key: string) => string;
  const shortId = id.length > 8 ? id.slice(0, 8) : id;

  return {
    title: `${translate("printDocument.pageTitle")} #${shortId}`,
  };
}

export default async function AdminQuoteExportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await requireAuth();

  const quote = await quotesService.getComplexQuote(id);
  if (!quote) {
    notFound();
  }

  return <QuotePrintDocument quote={quote} />;
}
