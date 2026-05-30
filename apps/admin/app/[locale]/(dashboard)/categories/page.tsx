import { CategoryHeader } from "@/features/categories/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import { CategoryTable } from "@/features/categories/components/category-table";
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

export default async function AdminCategoriesPage() {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tHeader = await getTranslations("AdminCategories.header");
  const categories = await categoryService.getAll();

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
        <CategoryTable categories={categories} />
      </div>
    </>
  );
}
