import { BrandHeader } from "@/features/brands/components";
import { DataTableSearchInput } from "@/components/common/data-table-search-input";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { BrandGrid } from "@/features/brands/components/brand-grid";
import { brandsApi } from "@/features/brands/api/brands.api";
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
  const t = await getTranslations({ locale, namespace: "adminDashboard.nav" });

  return {
    title: t("brands"),
  };
}

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tNav = await getTranslations("adminDashboard.nav");
  const tHeader = await getTranslations("adminBrands.header");
  const { data: res } = await brandsApi.list();
  const brands = res?.data ?? [];

  const resolvedSearchParams = await searchParams;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;

  const searchLower = search?.trim().toLowerCase();
  const filteredBrands = searchLower
    ? brands.filter((b) =>
        [b.name, b.slug, b.description].some((field) =>
          field?.toLowerCase().includes(searchLower),
        ),
      )
    : brands;

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("brands") },
        ]}
      />

      <BrandHeader
        title={tHeader("title")}
        description={tHeader("description")}
        showAddButton={true}
      />

      <div className="flex w-full flex-col gap-4">
        <DataTableSearchInput placeholder={tHeader("searchPlaceholder")} />
        <BrandGrid brands={filteredBrands} />
      </div>
    </div>
  );
}
