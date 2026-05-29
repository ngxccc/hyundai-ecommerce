import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductPagination } from "@/features/products/components/product-pagination";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/features/dashboard/components";
import {
  productService,
  categoryService,
  brandService,
} from "@nhatnang/database/services";
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
  const after =
    typeof params["after"] === "string" ? params["after"] : undefined;
  const before =
    typeof params["before"] === "string" ? params["before"] : undefined;
  const categoryId =
    typeof params["categoryId"] === "string" ? params["categoryId"] : undefined;
  const brandId =
    typeof params["brandId"] === "string" ? params["brandId"] : undefined;
  const fuelType =
    typeof params["fuelType"] === "string" ? params["fuelType"] : undefined;
  const phase =
    typeof params["phase"] === "string" ? params["phase"] : undefined;
  const status =
    typeof params["status"] === "string" ? params["status"] : undefined;
  const isQuoteOnly = params["isQuoteOnly"] === "true";
  const search =
    typeof params["search"] === "string" ? params["search"] : undefined;
  const engineBrand =
    typeof params["engineBrand"] === "string" ? params["engineBrand"] : undefined;
  const alternatorBrand =
    typeof params["alternatorBrand"] === "string" ? params["alternatorBrand"] : undefined;
  const voltageStr = typeof params["voltage"] === "string" ? params["voltage"] : undefined;
  const minPowerStr = typeof params["minPower"] === "string" ? params["minPower"] : undefined;
  const maxPowerStr = typeof params["maxPower"] === "string" ? params["maxPower"] : undefined;

  const voltage = voltageStr ? Number(voltageStr) : undefined;
  const minPower = minPowerStr ? Number(minPowerStr) : undefined;
  const maxPower = maxPowerStr ? Number(maxPowerStr) : undefined;

  const options = {
    after,
    before,
    categoryId,
    brandId,
    fuelType,
    phase,
    voltage: voltage !== undefined && !isNaN(voltage) ? voltage : undefined,
    minPower: minPower !== undefined && !isNaN(minPower) ? minPower : undefined,
    maxPower: maxPower !== undefined && !isNaN(maxPower) ? maxPower : undefined,
    engineBrand,
    alternatorBrand,
    status,
    search,
    isQuoteOnly: isQuoteOnly ? true : undefined,
  };

  const [
    t,
    tNav,
    { data: products, nextCursor, prevCursor },
    categories,
    brands,
  ] = await Promise.all([
    getTranslations("AdminProducts.header"),
    getTranslations("AdminBreadcrumbs"),
    productService.getAll(20, options),
    categoryService.getAll(),
    brandService.getAll(),
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
          <ProductFilters categories={categories} brands={brands} />

          {/* Product Grid */}
          <ProductGrid products={products} />

          {/* Pagination */}
          <ProductPagination nextCursor={nextCursor} prevCursor={prevCursor} />
        </div>
      </div>
    </>
  );
}
