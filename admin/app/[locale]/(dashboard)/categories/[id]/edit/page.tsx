import { CategoryHeader } from "@/features/categories/components";
import { CategoryForm } from "@/features/categories/components/category-form";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({
    locale,
    namespace: "adminCategoryForm",
  });

  return {
    title: t("editTitle"),
  };
}

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tNav = await getTranslations("adminDashboard.nav");
  const tForm = await getTranslations("adminCategoryForm");

  const [categoriesRes, categoryRes] = await Promise.all([
    categoriesApi.list(),
    categoriesApi.getById(id),
  ]);
  const categories = categoriesRes.data?.data ?? [];
  const category = categoryRes.data?.data;

  if (!category) {
    notFound();
  }

  return (
    <>
      <CategoryHeader
        title={tForm("editTitle")}
        description={tForm("editDescription")}
        showAddButton={false}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <CategoryForm
          initialData={category}
          categories={categories}
          breadcrumbs={
            <AdminBreadcrumbs
              items={[
                { label: tNav("overview"), href: "/" },
                { label: tNav("categories"), href: "/categories" },
                { label: tForm("editTitle") },
              ]}
            />
          }
        />
      </div>
    </>
  );
}
