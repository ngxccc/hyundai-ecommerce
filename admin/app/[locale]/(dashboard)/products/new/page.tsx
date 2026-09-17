import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { ProductForm } from "@/features/products/components/product-form";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { brandsApi } from "@/features/brands/api/brands.api";
import { CenteredSpinner } from "@/components/common";

export default async function CreateProductPage() {
  const [t, tNav] = await Promise.all([
    getTranslations("adminProductForm"),
    getTranslations("adminDashboard.nav"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("products"), href: "/products" },
          { label: t("title") },
        ]}
      />

      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <CreateProductContent />
      </Suspense>
    </div>
  );
}

async function CreateProductContent() {
  await connection();
  const [categoriesRes, brandsRes] = await Promise.all([
    categoriesApi.list(),
    brandsApi.list(),
  ]);
  const categories = categoriesRes.data?.data ?? [];
  const brands = brandsRes.data?.data ?? [];

  return <ProductForm categories={categories} brands={brands} />;
}
