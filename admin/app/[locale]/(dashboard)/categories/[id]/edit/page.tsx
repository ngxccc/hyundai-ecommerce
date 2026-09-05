import { CategoryHeader } from "@/features/categories/components";
import { CategoryForm } from "@/features/categories/components/category-form";
import { api } from "@/lib/api-client";
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
    namespace: "AdminCategoryForm",
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
  const tNav = await getTranslations("AdminDashboard.nav");
  const tForm = await getTranslations("AdminCategoryForm");

  const [categoriesRes, categoryRes] = await Promise.all([
    api.GET("/categories"),
    api.GET("/categories/{id}", { params: { path: { id } } }),
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
