import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { adminApiClient } from "@/lib/api-client";

export default async function CreateProductPage() {
  const [t, tNav, categories, brands] = await Promise.all([
    getTranslations("AdminProductForm"),
    getTranslations("AdminDashboard.nav"),
    adminApiClient.categories.list(),
    adminApiClient.brands.list(),
  ]);

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
