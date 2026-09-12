import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { brandsApi } from "@/features/brands/api/brands.api";

export default async function CreateProductPage() {
  const [t, tNav, categoriesRes, brandsRes] = await Promise.all([
    getTranslations("adminProductForm"),
    getTranslations("adminDashboard.nav"),
    categoriesApi.list(),
    brandsApi.list(),
  ]);
  const categories = categoriesRes.data?.data ?? [];
  const brands = brandsRes.data?.data ?? [];

  return (
    <>
      <ProductHeader
        title={t("title")}
        description={t("description")}
        showAddButton={false}
      />
      <div className="flex-1 space-y-4 p-2">
        <div className="mx-auto">
          <ProductForm
            categories={categories}
            brands={brands}
            breadcrumbs={
              <AdminBreadcrumbs
                items={[
                  { label: tNav("overview"), href: "/" },
                  { label: tNav("products"), href: "/products" },
                  { label: t("title") },
                ]}
              />
            }
          />
        </div>
      </div>
    </>
  );
}
