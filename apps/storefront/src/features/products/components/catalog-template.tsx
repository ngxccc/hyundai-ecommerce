import { Suspense } from "react";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import {
  productService,
  categoryService,
  brandService,
} from "@/shared/services";
import { ProductSort } from "./product-sort";
import { ProductPagination } from "./product-pagination";
import { ActiveFilterChips } from "./active-filter-chips";
import { DesktopProductFilters } from "./desktop-product-filters";
import { ProductFilterSheet } from "./product-filter-sheet";
import { ProductCard } from "./product-card";
import { Skeleton } from "@nhatnang/ui/components/ui/skeleton";
import type { CatalogSearchParams } from "../types/catalog";
interface CatalogTemplateProps {
  title?: string;
  categorySlug?: string | undefined;
  searchParams: Promise<CatalogSearchParams> | CatalogSearchParams;
  locale?: Locale;
}

export async function CatalogTemplate({
  title,
  categorySlug,
  searchParams: searchParamsPromise,
  locale,
}: CatalogTemplateProps) {
  const searchParams = await searchParamsPromise;

  // Redirect handling if `category` query param is present
  const categoryQuery = searchParams.category as string | string[] | undefined;
  if (categoryQuery && locale) {
    const nextParams = new URLSearchParams();
    Object.entries(
      searchParams as Record<string, string | string[] | undefined>,
    ).forEach(([key, value]) => {
      if (key !== "category" && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((val) => nextParams.append(key, String(val)));
        } else {
          nextParams.append(key, String(value));
        }
      }
    });
    const queryString = nextParams.toString();
    const targetSlug = Array.isArray(categoryQuery)
      ? categoryQuery[0]!
      : categoryQuery;
    redirect({
      href: `/products/category/${targetSlug}${queryString ? `?${queryString}` : ""}`,
      locale: locale,
    });
  }
  const t = await getTranslations("Catalog");

  // Get raw search parameters
  const brandParam = searchParams.brand;
  const search = searchParams.q;
  const sort = searchParams.sort;
  const after = searchParams.after;
  const before = searchParams.before;

  const fuelType = searchParams.fuelType;
  const phase = searchParams.phase;
  const voltageParam = searchParams.voltage;
  const voltage = voltageParam ? Number(voltageParam) : undefined;
  const minPowerParam = searchParams.minPower;
  const minPower = minPowerParam ? Number(minPowerParam) : undefined;
  const maxPowerParam = searchParams.maxPower;
  const maxPower = maxPowerParam ? Number(maxPowerParam) : undefined;
  const engineBrand = searchParams.engineBrand;
  const alternatorBrand = searchParams.alternatorBrand;

  // Resolve categoryIds if category slug is provided
  let categoryIds: string[] | undefined;
  if (categorySlug) {
    const categoriesList = await categoryService.getCategories(locale!);
    const targetCategory = categoriesList.find(
      (cat) => cat.slug === categorySlug,
    );
    if (targetCategory) {
      categoryIds = await categoryService.getCategoryDescendants(
        targetCategory.id,
      );
    }
  }

  // Fetch categories and brands from database first
  const [categoriesTree, allBrands] = await Promise.all([
    categoryService.getCategoryTree(locale!),
    brandService.getBrands(locale!),
  ]);

  // Resolve brandIds from brand slugs in URL param
  let brandIds: string[] | undefined;
  if (brandParam) {
    const brandSlugs = brandParam.split(",").filter(Boolean);
    brandIds = allBrands
      .filter((b) => brandSlugs.includes(b.slug))
      .map((b) => b.id);
  }

  // Fetch filtered products using resolved category and brand IDs
  const productsData = await productService.getProducts(locale!, 12, {
    categoryIds,
    brandIds,
    search,
    sort,
    after,
    before,
    fuelType,
    phase,
    voltage,
    minPower,
    maxPower,
    engineBrand,
    alternatorBrand,
    status: "active",
  });

  const { data: productsList, hasMore, nextCursor, prevCursor } = productsData;

  const displayTitle = title ?? t("title");

  return (
    <div className="bg-background min-h-screen pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="font-display text-foreground text-4xl font-extrabold tracking-tighter md:text-5xl">
            {displayTitle}
          </h1>
          {search && (
            <p className="text-muted-foreground mt-2 text-sm">
              {t("search_results", {
                query: search,
                count: productsList.length.toString(),
              })}
            </p>
          )}
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters Sidebar (Desktop) */}
          <div className="hidden lg:block">
            <div className="bg-muted/10 sticky top-24 rounded-lg border p-4">
              <DesktopProductFilters
                categories={categoriesTree}
                brands={allBrands}
                selectedCategorySlug={categorySlug}
                searchParams={searchParams}
              />
            </div>
          </div>

          {/* Filters Sheet (Mobile) */}
          <div className="lg:hidden">
            <ProductFilterSheet
              categories={categoriesTree}
              brands={allBrands}
              selectedCategorySlug={categorySlug}
              searchParams={searchParams}
            />
          </div>

          {/* Product Listing */}
          <div className="space-y-6 lg:col-span-3">
            {/* Top Bar (Sorting + Summary) */}
            <div className="flex items-center justify-between border-b pb-4">
              <p className="text-muted-foreground text-sm font-medium">
                {t("showing_products", {
                  count: productsList.length.toString(),
                })}
              </p>
              <ProductSort
                currentSort={searchParams.sort ?? "newest"}
                searchParams={searchParams}
              />
            </div>

            {/* Active Filter Chips */}
            <Suspense
              fallback={
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>
              }
            >
              <ActiveFilterChips />
            </Suspense>
            {/* Product Grid */}
            {productsList.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {productsList.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-muted-foreground text-lg font-medium">
                  {t("no_products")}
                </p>
              </div>
            )}

            {/* Pagination */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              }
            >
              <ProductPagination
                nextCursor={nextCursor}
                prevCursor={prevCursor}
                hasMore={hasMore}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
