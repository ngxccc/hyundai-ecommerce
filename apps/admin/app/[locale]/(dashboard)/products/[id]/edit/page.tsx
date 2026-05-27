import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/features/products/components/product-form";
import { productService, categoryService } from "@nhatnang/database/services";
import { notFound } from "next/navigation";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, t, categories] = await Promise.all([
    productService.getById(id),
    getTranslations("AdminProductForm"),
    categoryService.getAll(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductHeader
        title={t("editTitle")}
        showAddButton={false}
      />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AdminBreadcrumbs
          items={[
            { label: "Bảng điều khiển", href: "/" },
            { label: "Sản phẩm", href: "/products" },
            { label: t("editTitle") },
          ]}
        />
        <div className="mx-auto">
          <ProductForm initialData={product} categories={categories} />
        </div>
      </div>
    </>
  );
}
