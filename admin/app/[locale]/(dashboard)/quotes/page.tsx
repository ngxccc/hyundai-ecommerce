import { Suspense } from "react";
import { BrandHeader } from "@/features/brands/components";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Plus } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { QuoteList } from "@/features/quotes/components";
import { quotesApi } from "@/features/quotes/api/quotes.api";
import { OffsetPagination } from "@/components/common/offset-pagination";
import { quoteStatusEnum } from "@/constants";
import type { AdminQuote, QuoteQueryParams } from "@/types/api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { connection } from "next/server";
import type { Metadata } from "next";
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
    title: t("listTitle"),
  };
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [tNav, tHeader] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminQuotes"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tHeader("listTitle") },
        ]}
      />

      <BrandHeader
        title={tHeader("listTitle")}
        description={tHeader("listDescription")}
        actions={
          <Button asChild variant="default" className="gap-2 shadow-xs">
            <Link href="/quotes/new">
              <Plus className="size-4" />
              <span>{tHeader("composer.headerTitle")}</span>
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <QuotesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function QuotesContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
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
  const isQuoteStatus = (
    val: string,
  ): val is NonNullable<QuoteQueryParams["status"]> =>
    (quoteStatusEnum.enumValues as readonly string[]).includes(val);
  const status: QuoteQueryParams["status"] =
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
    <div className="flex w-full flex-col gap-4">
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
  );
}
