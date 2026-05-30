import { CategoryHeader } from "@/features/categories/components";
import { CategoryForm } from "@/features/categories/components/category-form";
import { categoryService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";
import { AdminBreadcrumbs } from "@/features/dashboard/components";

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
  const t = await getTranslations({
    locale,
    namespace: "AdminCategoryForm",
  });

  return {
    title: t("title"),
  };
}

export default async function AdminNewCategoryPage() {
  const tNav = await getTranslations("AdminDashboard.nav");
  const tForm = await getTranslations("AdminCategoryForm");

  const categories = await categoryService.getAll();

  return (
    <>
      <CategoryHeader
        title={tForm("title")}
        description={tForm("description")}
        showAddButton={false}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("categories"), href: "/categories" },
            { label: tForm("title") },
          ]}
        />

        <CategoryForm categories={categories} />
      </div>
    </>
  );
}
