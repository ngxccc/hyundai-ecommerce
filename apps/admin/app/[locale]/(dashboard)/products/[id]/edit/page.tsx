import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/features/products/components/product-form";
import {
  productService,
  categoryService,
  brandService,
} from "@nhatnang/database/services";
import { notFound } from "next/navigation";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, t, tNav, categories, brands] = await Promise.all([
    productService.getById(id),
    getTranslations("AdminProductForm"),
    getTranslations("AdminDashboard.nav"),
    categoryService.getAll(),
    brandService.getAll(),
  ]);

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
