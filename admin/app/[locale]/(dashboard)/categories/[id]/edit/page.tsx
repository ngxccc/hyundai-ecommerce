import { Suspense } from "react";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CenteredSpinner } from "@/components/common";

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
  const [tNav, tForm] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminCategoryForm"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("categories"), href: "/categories" },
          { label: tForm("editTitle") },
        ]}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <EditCategoryContent params={params} />
      </Suspense>
    </div>
  );
}

async function EditCategoryContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const [categoriesRes, categoryRes] = await Promise.all([
    categoriesApi.list(),
    categoriesApi.getById(id),
  ]);
  const categories = categoriesRes.data?.data ?? [];
  const category = categoryRes.data?.data;

  if (!category) {
    notFound();
  }

  return <CategoryForm initialData={category} categories={categories} />;
}
