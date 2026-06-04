import { CategoryHeader, CategoryFilters } from "@/features/categories/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { CategoryGrid } from "@/features/categories/components/category-grid";
import { categoryService } from "@nhatnang/database/services";
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
  const categories = await categoryService.getAll();

  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams["search"] === "string" ? resolvedSearchParams["search"] : undefined;

  const filteredCategories = search
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase()),
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
        <CategoryFilters />
        <CategoryGrid categories={filteredCategories} allCategories={categories} />
      </div>
    </>
  );
}
