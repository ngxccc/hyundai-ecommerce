import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { ProductForm } from "@/features/products/components/product-form";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { brandsApi } from "@/features/brands/api/brands.api";

export default async function CreateProductPage() {
  await connection();
  const [t, tNav, categoriesRes, brandsRes] = await Promise.all([
    getTranslations("adminProductForm"),
    getTranslations("adminDashboard.nav"),
    categoriesApi.list(),
    brandsApi.list(),
  ]);
  const categories = categoriesRes.data?.data ?? [];
  const brands = brandsRes.data?.data ?? [];

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("products"), href: "/products" },
          { label: t("title") },
        ]}
      />

      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
