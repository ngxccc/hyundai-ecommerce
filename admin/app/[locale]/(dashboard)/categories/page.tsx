import { CategoryHeader } from "@/features/categories/components";
import { DataTableSearchInput } from "@/shared/components/data-table-search-input";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { CategoryGrid } from "@/features/categories/components/category-grid";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
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
    title: t("categories"),
  };
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tNav = await getTranslations("adminDashboard.nav");
  const tHeader = await getTranslations("adminCategories.header");
  const { data: res } = await categoriesApi.list();
  const categories = res?.data ?? [];

  const resolvedSearchParams = await searchParams;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;

  const searchLower = search?.trim().toLowerCase();
  const filteredCategories = searchLower
    ? categories.filter((c) =>
        [c.nameVi, c.nameEn, c.descriptionVi, c.descriptionEn].some((field) =>
          field?.toLowerCase().includes(searchLower),
        ),
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
