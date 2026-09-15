import { Suspense } from "react";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/routing";
import {
  productService,
  categoryService,
  brandService,
  type StorefrontCategory,
} from "@/services";
import { ProductPagination } from "./product-pagination";
import { ActiveFilterChips } from "./active-filter-chips";
import { TopProductFilters } from "./top-product-filters";
import { SubcategoryPills } from "./subcategory-pills";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { RotateCcw, PackageSearch } from "lucide-react";
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
          value.forEach((val) => {
            nextParams.append(key, String(val));
          });
        } else {
          nextParams.append(key, String(value));
        }
      }
    });
    const queryString = nextParams.toString();
    const targetSlug = Array.isArray(categoryQuery)
      ? categoryQuery[0]
      : categoryQuery;
    redirect({
      href: `/categories/${targetSlug}${queryString ? `?${queryString}` : ""}`,
      locale: locale,
    });
  }
  const t = await getTranslations("Catalog");

  // Get raw search parameters
  const brandParam = searchParams.brand;
  const search = searchParams.q;
  const sort = searchParams.sort;
  const pageParam = searchParams.page ?? searchParams.after;
  const page = pageParam ? Number(pageParam) : 1;

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

  // Resolve targetCategory and categoryIds if category slug is provided
  let targetCategory: StorefrontCategory | undefined;
  let categoryIds: string[] | undefined;
  if (categorySlug) {
    const categoriesList = await categoryService.getCategories(locale!);
    targetCategory = categoriesList.find((cat) => cat.slug === categorySlug);
    if (targetCategory) {
      categoryIds = await categoryService.getCategoryDescendants(
        targetCategory.id,
      );
    }
  }

  // Fetch categories tree, brands, and catalog facet metadata in parallel
  const [categoriesTree, allBrands, catalogMetadata] = await Promise.all([
    categoryService.getCategoryTree(locale!),
    brandService.getBrands(locale!),
    productService.getFiltersMetadata(locale!),
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
  const productsData = await productService.getProducts(locale!, 16, {
    categoryId: targetCategory?.id,
    categoryIds,
    brandIds,
    search,
    sort,
    page,
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

  // Determine breadcrumb structure
  let currentCategoryNode = null;
  let parentCategoryNode = null;
  if (categorySlug) {
    for (const root of categoriesTree) {
      if (root.slug === categorySlug) {
        currentCategoryNode = root;
        break;
      }
      const child = root.children.find((c) => c.slug === categorySlug);
      if (child) {
        parentCategoryNode = root;
        currentCategoryNode = child;
        break;
      }
    }
  }

  return (
    <div className="bg-background min-h-screen pt-4 pb-16">
      <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">Sản phẩm</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {parentCategoryNode && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/categories/${parentCategoryNode.slug}`}>
                      {parentCategoryNode.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {currentCategoryNode && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentCategoryNode.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Heading: Accessible via sr-only for Google SEO & Screen Readers */}
        <h1 className="sr-only">{displayTitle}</h1>

        {search && (
          <div className="flex items-center justify-between border-b pb-2">
            <p className="text-muted-foreground text-xs font-medium">
              {t("search_results", {
                query: search,
                count: productsData.total.toString(),
              })}
            </p>
          </div>
        )}
        {/* Subcategory Navigation Pills */}
        <SubcategoryPills
          categories={categoriesTree}
          currentCategorySlug={categorySlug}
        />

        {/* Top Filter Bar */}
        <div className="bg-card rounded-xl border p-3 shadow-xs">
          <TopProductFilters brands={allBrands} metadata={catalogMetadata} />
        </div>

        {/* Active Filter Chips */}
        <Suspense
          fallback={
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          }
        >
          <ActiveFilterChips />
        </Suspense>

        {/* 100% Full-Width 4-Column Product Grid */}
        {productsList.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {productsList.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          /* Modern Clean Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-20 text-center">
            <div className="bg-muted/50 mb-4 flex size-14 items-center justify-center rounded-full">
              <PackageSearch className="text-muted-foreground size-7" />
            </div>
            <h3 className="font-display text-foreground text-lg font-bold">
              {t("no_products")}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-md text-xs sm:text-sm">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại. Vui lòng
              thử điều chỉnh hoặc xóa bớt tiêu chí lọc.
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={
                    categorySlug ? `/categories/${categorySlug}` : "/products"
                  }
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  Xóa tất cả bộ lọc
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {productsData.totalPages > 1 && (
          <div className="pt-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              }
            >
              <ProductPagination
                page={productsData.page}
                totalPages={productsData.totalPages}
                hasMore={hasMore}
                hasNextPage={hasMore}
                hasPrevPage={productsData.page > 1}
                nextCursor={nextCursor}
                prevCursor={prevCursor}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
