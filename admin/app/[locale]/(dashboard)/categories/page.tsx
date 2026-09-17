import { CategoryHeader } from "@/features/categories/components";
import { DataTableSearchInput } from "@/components/common/data-table-search-input";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { CategoryGrid } from "@/features/categories/components/category-grid";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { connection } from "next/server";
import type { Metadata } from "next";

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
  await connection();
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
        [c.name, c.slug, c.description].some((field) =>
          field?.toLowerCase().includes(searchLower),
        ),
      )
    : categories;

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("categories") },
        ]}
      />

      <CategoryHeader
        title={tHeader("title")}
        description={tHeader("description")}
        showAddButton={true}
      />

      <div className="flex w-full flex-col gap-4">
        <DataTableSearchInput placeholder={tHeader("searchPlaceholder")} />
        <CategoryGrid
          categories={filteredCategories}
          allCategories={categories}
        />
      </div>
    </div>
  );
}
