import { ProductHeader } from "@/features/products/components/product-header";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductPagination } from "@/features/products/components/product-pagination";
import { getTranslations } from "next-intl/server";
import { type Locale } from "next-intl";
import { routing } from "@/i18n/routing";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AdminMetadata" });

  return {
    title: t("products"),
  };
}

export default function AdminProductsPage() {
  return (
    <>
      <ProductHeader />

      <div className="mx-auto flex w-full flex-col gap-6 p-2">
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
