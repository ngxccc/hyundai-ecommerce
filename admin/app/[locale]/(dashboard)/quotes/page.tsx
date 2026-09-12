import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { QuoteList } from "@/features/quotes/components";
import { quotesApi } from "@/features/quotes/api/quotes.api";
import { OffsetPagination } from "@/shared/components/offset-pagination";
import { quoteStatusEnum } from "@/shared/constants";
import type { AdminQuote, QuoteStatus } from "@/types/api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminQuotes" });

  return {
    title: t("listTitle"),
  };
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tNav = await getTranslations("adminDashboard.nav");
  const tHeader = await getTranslations("adminQuotes");

  const resolvedSearchParams = await searchParams;
  const page =
    typeof resolvedSearchParams.page === "string"
      ? Number(resolvedSearchParams.page) || 1
      : 1;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;
  const statusParam =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : undefined;

  // Validate status parameter with type guard
  const isQuoteStatus = (val: string): val is QuoteStatus =>
    (quoteStatusEnum.enumValues as readonly string[]).includes(val);
  const status =
    statusParam && isQuoteStatus(statusParam) ? statusParam : undefined;

  // Fetch filtered quotes with backend SQL search and offset pagination
  const { data: quotesRes } = await quotesApi.list({
    page,
    limit: 20,
    status,
    search,
  });
  const quotes: AdminQuote[] = quotesRes?.data ?? [];
  const meta = quotesRes?.meta;

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
        <QuoteList quotes={quotes} />
        <OffsetPagination
          page={meta?.page ?? page}
          totalPages={meta?.totalPages ?? 1}
          total={meta?.total}
          hasNextPage={meta?.hasNextPage}
          hasPrevPage={meta?.hasPrevPage}
          label="báo giá"
        />
      </div>
    </>
  );
}
