import { CategoryHeader } from "@/features/categories/components";
import { CategoryForm } from "@/features/categories/components/category-form";
import { api } from "@/lib/api-client";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
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
  const t = await getTranslations({
    locale,
    namespace: "adminCategoryForm",
  });

  return {
    title: t("title"),
  };
}

export default async function AdminNewCategoryPage() {
  const tNav = await getTranslations("adminDashboard.nav");
  const tForm = await getTranslations("adminCategoryForm");

  const { data: res } = await api.GET("/api/v1/categories");
  const categories = res?.data ?? [];

  return (
    <>
      <CategoryHeader
        title={tForm("title")}
        description={tForm("description")}
        showAddButton={false}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <CategoryForm
          categories={categories}
          breadcrumbs={
            <AdminBreadcrumbs
              items={[
                { label: tNav("overview"), href: "/" },
                { label: tNav("categories"), href: "/categories" },
                { label: tForm("title") },
              ]}
            />
          }
        />
      </div>
    </>
  );
}
