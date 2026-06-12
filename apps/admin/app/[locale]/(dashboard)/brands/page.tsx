import { BrandHeader, BrandFilters } from "@/features/brands/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { BrandGrid } from "@/features/brands/components/brand-grid";
import { brandService } from "@nhatnang/database/services";
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
  const brands = await brandService.getAll();

  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams["search"] === "string" ? resolvedSearchParams["search"] : undefined;

  const filteredBrands = search
    ? brands.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          ((b.descriptionVi?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
           (b.descriptionEn?.toLowerCase().includes(search.toLowerCase()) ?? false)),
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
        <BrandFilters />
        <BrandGrid brands={filteredBrands} />
      </div>
    </>
  );
}
