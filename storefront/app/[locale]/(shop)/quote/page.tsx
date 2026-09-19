import { getTranslations } from "next-intl/server";
import { getCompanySettings } from "@/features/settings/api/company-settings.api";
import { QuoteRequestView } from "@/features/quote/components/quote-request-view";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Quote" });

  return {
    title: `${t("title")} | Hyundai Nhật Năng`,
    description: t("subtitle"),
  };
}

export default async function QuotePage() {
  const company = await getCompanySettings();
  return <QuoteRequestView company={company} />;
}
