import { BrandHeader } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { QuoteComposer } from "@/features/quotes/components";
import { requireAuth } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminQuotes" });
  const translate = t as unknown as (key: string) => string;

  return {
    title: translate("composer.pageTitle"),
  };
}

export default async function AdminNewQuotePage() {
  await requireAuth();

  const tNav = await getTranslations("AdminDashboard.nav");
  const t = await getTranslations("AdminQuotes");
  const translate = t as unknown as (key: string) => string;

  return (
    <>
      <BrandHeader
        title={translate("composer.headerTitle")}
        description={translate("composer.headerDescription")}
        showAddButton={false}
      />
      <div className="mx-auto flex w-full flex-col gap-6 p-4">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("quotes"), href: "/quotes" },
            { label: translate("composer.breadcrumbNew") },
          ]}
        />

        <QuoteComposer />
      </div>
    </>
  );
}
