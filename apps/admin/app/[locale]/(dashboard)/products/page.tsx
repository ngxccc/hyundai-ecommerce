import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductPagination } from "@/features/products/components/product-pagination";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import { productService } from "@nhatnang/database/services";
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

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const after = typeof params["after"] === "string" ? params["after"] : undefined;
  const before = typeof params["before"] === "string" ? params["before"] : undefined;

  const options: { after?: string; before?: string } = {};
  if (after) options.after = after;
  if (before) options.before = before;

  const [t, tNav, { data: products, nextCursor, prevCursor }] = await Promise.all([
    getTranslations("AdminProducts.header"),
    getTranslations("AdminBreadcrumbs"),
    productService.getAll(20, options),
  ]);

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
            { label: tNav("dashboard"), href: "/" },
            { label: tNav("products") },
          ]}
        />
        <div className="mx-auto flex w-full flex-col gap-6 pb-8">
          {/* Filters */}
          <ProductFilters />

          {/* Product Grid */}
          <ProductGrid products={products} />

          {/* Pagination */}
          <ProductPagination nextCursor={nextCursor} prevCursor={prevCursor} />
        </div>
      </div>
    </>
  );
}
