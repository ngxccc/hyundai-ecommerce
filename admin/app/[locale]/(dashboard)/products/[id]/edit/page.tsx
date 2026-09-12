import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/features/products/components/product-form";
import { productsApi } from "@/features/products/api/products.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { brandsApi } from "@/features/brands/api/brands.api";
import { notFound } from "next/navigation";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [productRes, t, tNav, categoriesRes, brandsRes] = await Promise.all([
    productsApi.getById(id),
    getTranslations("adminProductForm"),
    getTranslations("adminDashboard.nav"),
    categoriesApi.list(),
    brandsApi.list(),
  ]);
  const product = productRes.data?.data;
  const categories = categoriesRes.data?.data ?? [];
  const brands = brandsRes.data?.data ?? [];

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductHeader
        title={t("editTitle")}
        description={t("editDescription")}
        showAddButton={false}
      />
      <div className="flex-1 space-y-4 p-2">
        <div className="mx-auto">
          <ProductForm
            initialData={product}
            categories={categories}
            brands={brands}
            breadcrumbs={
              <AdminBreadcrumbs
                items={[
                  { label: tNav("overview"), href: "/" },
                  { label: tNav("products"), href: "/products" },
                  { label: t("editTitle") },
                ]}
              />
            }
          />
        </div>
      </div>
    </>
  );
}
