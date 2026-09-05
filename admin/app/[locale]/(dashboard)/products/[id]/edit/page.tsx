import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/features/products/components/product-form";
import { api } from "@/lib/api-client";
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
    api.GET("/products/{id}", { params: { path: { id } } }),
    getTranslations("AdminProductForm"),
    getTranslations("AdminDashboard.nav"),
    api.GET("/categories"),
    api.GET("/brands"),
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
