import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ProductForm } from "@/features/products/components/product-form";
import { productsApi } from "@/features/products/api/products.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { brandsApi } from "@/features/brands/api/brands.api";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { CenteredSpinner } from "@/components/common";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [t, tNav] = await Promise.all([
    getTranslations("adminProductForm"),
    getTranslations("adminDashboard.nav"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* 1. Breadcrumbs consistently on top */}
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("products"), href: "/products" },
          { label: t("editTitle") },
        ]}
      />

      {/* 2. Form content with integrated Header and actions */}
      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <EditProductContent params={params} />
      </Suspense>
    </div>
  );
}

async function EditProductContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const [productRes, categoriesRes, brandsRes] = await Promise.all([
    productsApi.getById(id),
    categoriesApi.list(),
    brandsApi.list(),
  ]);

  if (productRes.error) {
    if (productRes.error.status === 404) {
      notFound();
    }
    throw new Error(
      `Không thể tải thông tin sản phẩm: ${productRes.error.detail || "Lỗi máy chủ"} (Mã lỗi: ${productRes.error.status})`,
    );
  }

  const product = productRes.data.data;
  const categories = categoriesRes.data?.data ?? [];
  const brands = brandsRes.data?.data ?? [];

  if (!product) {
    notFound();
  }
  return (
    <ProductForm
      initialData={product}
      categories={categories}
      brands={brands}
    />
  );
}
