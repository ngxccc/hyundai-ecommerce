import type { _Translator, AppConfig } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  productService,
  categoryService,
  brandService,
} from "@nhatnang/database/services";
import { ProductSort } from "./product-sort";
import { ProductPagination } from "./product-pagination";
import { ActiveFilterChips } from "./active-filter-chips";
import { DesktopProductFilters } from "./desktop-product-filters";
import { ProductFilterSheet } from "./product-filter-sheet";
import Image from "next/image";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@nhatnang/ui/components/ui/card";
import { priceFormatter } from "@/shared/lib/utils";
import type { TProduct } from "@nhatnang/database/schemas";
import type { CatalogSearchParams } from "../types/catalog";

const formatSpecs = (
  specs: TProduct["specs"],
  tProduct: _Translator<AppConfig["Messages"], "ProductDetails">,
): string[] => {
  if (!specs || typeof specs !== "object") return [];
  const specsObj = specs as Record<
    string,
    string | number | boolean | null | undefined
  >;
  const specsArray: string[] = [];
  if (specsObj["power"]) specsArray.push(`${String(specsObj["power"])}kW`);
  if (typeof specsObj["fuelType"] === "string") {
    const fuelType = specsObj["fuelType"];
    if (
      fuelType === "gasoline" ||
      fuelType === "diesel" ||
      fuelType === "gas"
    ) {
      specsArray.push(tProduct(`fuelTypes.${fuelType}`));
    }
  }
  if (typeof specsObj["phase"] === "string") {
    const phase = specsObj["phase"];
    if (phase === "1phase" || phase === "3phase") {
      specsArray.push(tProduct(`phases.${phase}`));
    }
  }
  return specsArray;
};

interface CatalogTemplateProps {
  title?: string;
  categorySlug?: string | undefined;
  searchParams: CatalogSearchParams;
}

export async function CatalogTemplate({
  title,
  categorySlug,
  searchParams,
}: CatalogTemplateProps) {
  const t = await getTranslations("Catalog");
  const tHome = await getTranslations("HomePage.products");
  const tProduct = await getTranslations("ProductDetails");

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
    const categoriesList = await categoryService.getAll();
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
    categoryService.getCategoryTree(),
    brandService.getAll(),
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
  const productsData = await productService.getAll(12, {
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
              />
            </div>
          </div>

          {/* Filters Sheet (Mobile) */}
          <div className="lg:hidden">
            <ProductFilterSheet
              categories={categoriesTree}
              brands={allBrands}
              selectedCategorySlug={categorySlug}
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
            <ActiveFilterChips />

            {/* Product Grid */}
            {productsList.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {productsList.map((product, index) => {
                  const isLcp = index < 2;
                  return (
                    <Card
                      key={product.id}
                      className="group hover:border-primary/50 flex h-full flex-col gap-4 overflow-hidden py-0 transition-all hover:shadow-xl"
                    >
                      <Link href={`/products/${product.slug}`}>
                        <CardHeader className="relative aspect-4/3 w-full p-0">
                          <Image
                            src={
                              product.images[0] && product.images[0] !== ""
                                ? product.images[0]
                                : "https://placehold.co/400x300/png?text=No+Image"
                            }
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={isLcp}
                            loading={isLcp ? undefined : "lazy"}
                          />
                          <Badge className="absolute top-4 left-4 z-10 rounded-sm bg-black/70 px-3 py-1 text-white backdrop-blur-md hover:bg-black/70">
                            {tHome("model")}:{" "}
                            {product.specs?.model ?? t("unknown")}
                          </Badge>
                        </CardHeader>
                      </Link>

                      <CardContent className="flex grow flex-col gap-2">
                        <Link href={`/products/${product.slug}`}>
                          <h2 className="font-display text-foreground group-hover:text-primary line-clamp-2 text-xl leading-tight font-bold transition-colors">
                            {product.name}
                          </h2>
                        </Link>

                        {/* Specs List */}
                        <div className="flex flex-wrap gap-2">
                          {formatSpecs(product.specs, tProduct).map((spec) => (
                            <Badge
                              variant="secondary"
                              key={`${product.id}-${spec}`}
                              className="rounded-sm text-[13px] font-semibold"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="bg-muted/20 mt-auto flex items-center justify-between gap-1 border-t p-4 pt-4! lg:flex-col">
                        <span className="text-primary text-xl font-bold">
                          {product.isQuoteOnly
                            ? tHome("contact_price")
                            : priceFormatter.format(Number(product.price))}
                        </span>

                        <Button
                          asChild
                          size="lg"
                          className="font-bold tracking-wider uppercase lg:w-full"
                        >
                          <Link href={`/products/${product.slug}`}>
                            {product.isQuoteOnly
                              ? tHome("request_quote_cta")
                              : tHome("buy_now_cta")}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-muted-foreground text-lg font-medium">
                  {t("no_products")}
                </p>
              </div>
            )}

            {/* Pagination */}
            <ProductPagination
              nextCursor={nextCursor}
              prevCursor={prevCursor}
              hasMore={hasMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
