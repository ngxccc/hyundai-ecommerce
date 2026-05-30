import { CategoryHeader } from "@/features/categories/components";
import { CategoryForm } from "@/features/categories/components/category-form";
import { categoryService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
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

  const [categories, category] = await Promise.all([
    categoryService.getAll(),
    categoryService.getById(id),
  ]);

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
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("categories"), href: "/categories" },
            { label: tForm("editTitle") },
          ]}
        />

        <CategoryForm initialData={category} categories={categories} />
      </div>
    </>
  );
}
