import { BrandHeader } from "@/features/brands/components";
import { DataTableSearchInput } from "@/shared/components/data-table-search-input";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { BrandGrid } from "@/features/brands/components/brand-grid";
import { api } from "@/lib/api-client";
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
  const t = await getTranslations({ locale, namespace: "AdminDashboard.nav" });

  return {
    title: t("brands"),
  };
}

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tHeader = await getTranslations("AdminBrands.header");
  const { data: res } = await api.GET("/brands");
  const brands = res?.data ?? [];

  const resolvedSearchParams = await searchParams;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;

  const filteredBrands = search
    ? brands.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          (b.descriptionVi?.toLowerCase().includes(search.toLowerCase()) ??
            false) ||
          (b.descriptionEn?.toLowerCase().includes(search.toLowerCase()) ??
            false),
      )
    : brands;

  return (
    <>
      <BrandHeader
        title={tHeader("title")}
        description={tHeader("description")}
        showAddButton={true}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("brands") },
          ]}
        />
        <DataTableSearchInput placeholder={tHeader("searchPlaceholder")} />
        <BrandGrid brands={filteredBrands} />
      </div>
    </>
  );
}
