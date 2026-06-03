import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import {
  QuoteHeader,
  QuotePricingCockpit,
  QuoteNegotiationChat,
} from "@/features/quotes/components";
import { quotesService } from "@nhatnang/database/services";
import { requireAuth } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { type Locale } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminQuotes" });

  return {
    title: `${t("title")} #${id.slice(0, 8)}`,
  };
}

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const currentUserId = session.user.id;

  const tNav = await getTranslations("AdminDashboard.nav");
  const tHeader = await getTranslations("AdminQuotes");

  const quote = await quotesService.getComplexQuote(id);
  if (!quote) {
    notFound();
  }

  return (
    <>
      <BrandHeader
        title={`${tHeader("title")} #${id.slice(0, 8)}`}
        description={tHeader("description")}
        showAddButton={false}
      />

      <div className="mx-auto flex w-full flex-col gap-6 p-4">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: "Báo giá", href: "/quotes" },
            { label: `#${id.slice(0, 8)}` },
          ]}
        />

        <QuoteHeader quote={quote} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <QuotePricingCockpit quote={quote} />
          </div>
          <div className="lg:col-span-1">
            <QuoteNegotiationChat quote={quote} currentUserId={currentUserId} />
          </div>
        </div>
      </div>
    </>
  );
}
