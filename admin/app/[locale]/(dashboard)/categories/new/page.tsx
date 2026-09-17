import { CategoryHeader } from "@/features/categories/components";
import { CategoryForm } from "@/features/categories/components/category-form";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { connection } from "next/server";
import type { Metadata } from "next";

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
  await connection();
  const tNav = await getTranslations("adminDashboard.nav");
  const tForm = await getTranslations("adminCategoryForm");

  const { data: res } = await categoriesApi.list();
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
