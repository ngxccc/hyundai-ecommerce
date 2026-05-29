import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/features/products/components/product-form";
import {
  productService,
  categoryService,
  brandService,
} from "@nhatnang/database/services";
import { notFound } from "next/navigation";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, t, tNav, categories, brands] = await Promise.all([
    productService.getById(id),
    getTranslations("AdminProductForm"),
    getTranslations("AdminBreadcrumbs"),
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
        <AdminBreadcrumbs
          items={[
            { label: tNav("dashboard"), href: "/" },
            { label: tNav("products"), href: "/products" },
            { label: t("editTitle") },
          ]}
        />
        <div className="mx-auto">
          <ProductForm
            initialData={product}
            categories={categories}
            brands={brands}
          />
        </div>
      </div>
    </>
  );
}
