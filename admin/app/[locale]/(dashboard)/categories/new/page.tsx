import { Suspense } from "react";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { connection } from "next/server";
import type { Metadata } from "next";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CenteredSpinner } from "@/components/common";

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
          { label: tForm("title") },
        ]}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <NewCategoryContent />
      </Suspense>
    </div>
  );
}

async function NewCategoryContent() {
  await connection();
  const { data: res } = await categoriesApi.list();
  const categories = res?.data ?? [];

  return <CategoryForm categories={categories} />;
}
