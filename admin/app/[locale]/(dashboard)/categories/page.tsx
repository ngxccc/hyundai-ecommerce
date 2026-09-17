import { Suspense } from "react";
import { CategoryHeader } from "@/features/categories/components";
import { DataTableSearchInput } from "@/components/common/data-table-search-input";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { CategoryTable } from "@/features/categories/components/category-table";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
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
  const [tNav, tHeader] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminCategories.header"),
  ]);

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

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <CategoriesContent
          searchParams={searchParams}
          searchPlaceholder={tHeader("searchPlaceholder")}
        />
      </Suspense>
    </div>
  );
}

async function CategoriesContent({
  searchParams,
  searchPlaceholder,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  searchPlaceholder: string;
}) {
  await connection();
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
    <div className="flex w-full flex-col gap-4">
      <DataTableSearchInput placeholder={searchPlaceholder} />
      <CategoryTable
        categories={filteredCategories}
        allCategories={categories}
      />
    </div>
  );
}
