import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductPagination } from "@/features/products/components/product-pagination";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminMetadata" });

  return {
    title: t("products"),
  };
};

export default async function AdminProductsPage() {
  const t = await getTranslations("AdminProducts.header");

  return (
    <>
      <ProductHeader
        title={t("title")}
        description={t("description")}
        showAddButton={true}
      />
      <div className="mx-auto flex w-full flex-col gap-6 p-2">
        <AdminBreadcrumbs
          items={[
            { label: "Bảng điều khiển", href: "/" },
            { label: "Sản phẩm" },
          ]}
        />
        <div className="mx-auto flex w-full flex-col gap-6 pb-8">
        {/* Filters */}
        <ProductFilters />

        {/* Product Grid */}
        <ProductGrid />

        {/* Pagination */}
        <ProductPagination />
      </div>
      </div>
    </>
  );
}
