import { CategoryHeader } from "@/features/categories/components";
import { DataTableSearchInput } from "@/shared/components/data-table-search-input";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { CategoryGrid } from "@/features/categories/components/category-grid";
import { adminApiClient } from "@/lib/api-client";
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
    title: t("categories"),
  };
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tHeader = await getTranslations("AdminCategories.header");
  const categories = await adminApiClient.categories.list();

  const resolvedSearchParams = await searchParams;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;

  const filteredCategories = search
    ? categories.filter(
        (c) =>
          c.nameVi.toLowerCase().includes(search.toLowerCase()) ||
          (c.nameEn?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          (c.descriptionVi?.toLowerCase().includes(search.toLowerCase()) ??
            false) ||
          (c.descriptionEn?.toLowerCase().includes(search.toLowerCase()) ??
            false),
      )
    : categories;

  return (
    <>
      <CategoryHeader
        title={tHeader("title")}
        description={tHeader("description")}
        showAddButton={true}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("categories") },
          ]}
        />
        <DataTableSearchInput placeholder={tHeader("searchPlaceholder")} />
        <CategoryGrid
          categories={filteredCategories}
          allCategories={categories}
        />
      </div>
    </>
  );
}
