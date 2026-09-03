import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { QuoteList } from "@/features/quotes/components";
import { quotesService } from "@nhatnang/database/services";
import { quoteStatusEnum, type Quote } from "@nhatnang/database/schemas";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminQuotes" });

  return {
    title: t("listTitle"),
  };
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tHeader = await getTranslations("AdminQuotes");

  const resolvedSearchParams = await searchParams;
  const search =
    typeof resolvedSearchParams["search"] === "string"
      ? resolvedSearchParams["search"]
      : undefined;
  const statusParam =
    typeof resolvedSearchParams["status"] === "string"
      ? resolvedSearchParams["status"]
      : undefined;

  const status =
    statusParam &&
    (quoteStatusEnum.enumValues as readonly string[]).includes(statusParam)
      ? (statusParam as Quote["status"])
      : undefined;

  const quotes = await quotesService.listQuotes(status ? { status } : undefined);

  // In-memory search filtering
  const searchLower = search?.toLowerCase();
  const filteredQuotes = searchLower
    ? quotes.filter((q) => {
        const idMatch = q.id.toLowerCase().includes(searchLower);
        const quoteNoMatch = q.quoteNumber?.toLowerCase().includes(searchLower) ?? false;
        const customerMatch = q.customerName?.toLowerCase().includes(searchLower) ?? false;
        const emailMatch = q.customerEmail?.toLowerCase().includes(searchLower) ?? false;
        const companyMatch = q.companyName?.toLowerCase().includes(searchLower) ?? false;
        const userNameMatch = q.user?.name?.toLowerCase().includes(searchLower) ?? false;
        const userEmailMatch = q.user?.email?.toLowerCase().includes(searchLower) ?? false;
        const userCompanyMatch = q.user?.companyName?.toLowerCase().includes(searchLower) ?? false;
        return (
          idMatch ||
          quoteNoMatch ||
          customerMatch ||
          emailMatch ||
          companyMatch ||
          userNameMatch ||
          userEmailMatch ||
          userCompanyMatch
        );
      })
    : quotes;

  return (
    <>
      <BrandHeader
        title={tHeader("listTitle")}
        description={tHeader("listDescription")}
        showAddButton={false}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tHeader("listTitle") },
          ]}
        />
        <QuoteList quotes={filteredQuotes} />
      </div>
    </>
  );
}
