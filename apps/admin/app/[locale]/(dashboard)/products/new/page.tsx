import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import { categoryService, brandService } from "@nhatnang/database/services";

export default async function CreateProductPage() {
  const [t, tNav, categories, brands] = await Promise.all([
    getTranslations("AdminProductForm"),
    getTranslations("AdminBreadcrumbs"),
    categoryService.getAll(),
    brandService.getAll(),
  ]);

  return (
    <>
      <ProductHeader
        title={t("title")}
        description={t("description")}
        showAddButton={false}
      />
      <div className="flex-1 space-y-4 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("dashboard"), href: "/" },
            { label: tNav("products"), href: "/products" },
            { label: t("title") },
          ]}
        />
        <div className="mx-auto">
          <ProductForm categories={categories} brands={brands} />
        </div>
      </div>
    </>
  );
}
