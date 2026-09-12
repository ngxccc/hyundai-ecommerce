import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductPagination } from "@/features/products/components/product-pagination";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { productsApi } from "@/features/products/api/products.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { brandsApi } from "@/features/brands/api/brands.api";
import { parseProductQueryParams } from "@/features/products/utils/product-query-parser";
import type { AdminProduct } from "@/types/api";
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
  const t = await getTranslations({ locale, namespace: "adminMetadata" });

  return {
    title: t("products"),
  };
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseProductQueryParams(await searchParams);

  const [t, tNav, productsRes, categoriesRes, brandsRes] = await Promise.all([
    getTranslations("adminProducts.header"),
    getTranslations("adminDashboard.nav"),
    productsApi.list(query),
    categoriesApi.list(),
    brandsApi.list(),
  ]);
  const categories = categoriesRes.data?.data ?? [];
  const brands = brandsRes.data?.data ?? [];
  const products: AdminProduct[] = productsRes.data?.data ?? [];
  const meta = productsRes.data?.meta;

  return (
    <>
      <ProductHeader
        title={t("title")}
        description={t("description")}
        showAddButton={true}
      />

      <div className="mx-auto flex w-full flex-col gap-2 p-2">
        <AdminBreadcrumbs
          items={[
            { label: tNav("overview"), href: "/" },
            { label: tNav("products") },
          ]}
        />
        <div className="mx-auto flex w-full flex-col gap-4 pb-8">
          {/* Filters */}
          <ProductFilters categories={categories} brands={brands} />

          {/* Product Grid */}
          <ProductGrid products={products} />

          {/* Pagination */}
          <ProductPagination
            page={
              meta?.page ?? (typeof query.page === "number" ? query.page : 1)
            }
            totalPages={meta?.totalPages ?? 1}
            total={meta?.total}
            hasNextPage={meta?.hasNextPage}
            hasPrevPage={meta?.hasPrevPage}
          />
        </div>
      </div>
    </>
  );
}
