import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  productService,
  categoryService,
  brandService,
} from "@nhatnang/database/services";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductSort } from "@/features/products/components/product-sort";
import { ProductPagination } from "@/features/products/components/product-pagination";
import { CldImage } from "@/shared/components/CldImageWrapper";
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

interface CatalogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    brand?: string;
    q?: string;
    sort?: "price_asc" | "price_desc" | "newest";
    after?: string;
    before?: string;
    fuelType?: string;
    phase?: string;
    voltage?: string;
    minPower?: string;
    maxPower?: string;
    engineBrand?: string;
    alternatorBrand?: string;
  }>;
}

const formatSpecs = (specs: TProduct["specs"]): string[] => {
  if (!specs || typeof specs !== "object") return [];
  const specsObj = specs as Record<
    string,
    string | number | boolean | null | undefined
  >;
  const specsArray: string[] = [];
  if (specsObj["power"]) specsArray.push(`${String(specsObj["power"])}kW`);
  if (typeof specsObj["fuelType"] === "string") {
    const fuelMap: Record<string, string> = {
      gasoline: "Xăng",
      diesel: "Diesel",
      gas: "Gas",
    };
    specsArray.push(fuelMap[specsObj["fuelType"]] ?? specsObj["fuelType"]);
  }
  if (typeof specsObj["phase"] === "string") {
    specsArray.push(specsObj["phase"] === "1phase" ? "1 Pha" : "3 Pha");
  }
  return specsArray;
};

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps) {
  await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations("Catalog");
  const tHome = await getTranslations("HomePage.products");

  // Get raw search parameters
  const categorySlug = resolvedSearchParams.category;
  const brandParam = resolvedSearchParams.brand;
  const search = resolvedSearchParams.q;
  const sort = resolvedSearchParams.sort;
  const after = resolvedSearchParams.after;
  const before = resolvedSearchParams.before;

  const fuelType = resolvedSearchParams.fuelType;
  const phase = resolvedSearchParams.phase;
  const voltageParam = resolvedSearchParams.voltage;
  const voltage = voltageParam ? Number(voltageParam) : undefined;
  const minPowerParam = resolvedSearchParams.minPower;
  const minPower = minPowerParam ? Number(minPowerParam) : undefined;
  const maxPowerParam = resolvedSearchParams.maxPower;
  const maxPower = maxPowerParam ? Number(maxPowerParam) : undefined;
  const engineBrand = resolvedSearchParams.engineBrand;
  const alternatorBrand = resolvedSearchParams.alternatorBrand;

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

  // Resolve brandIds
  const brandIds = brandParam
    ? brandParam.split(",").filter(Boolean)
    : undefined;

  // Fetch categories, brands, and filtered products from database
  const [categoriesTree, allBrands, productsData] = await Promise.all([
    categoryService.getCategoryTree(),
    brandService.getAll(),
    productService.getAll(12, {
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
    }),
  ]);

  const { data: productsList, hasMore, nextCursor, prevCursor } = productsData;

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="font-display text-foreground text-4xl font-extrabold tracking-tighter md:text-5xl">
            {t("title")}
          </h1>
          {search && (
            <p className="text-muted-foreground mt-2 text-sm">
              Tìm kiếm cho: &quot;{search}&quot; ({productsList.length} kết quả)
            </p>
          )}
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:block">
            <div className="bg-muted/10 sticky top-24 rounded-lg border p-6">
              <ProductFilters categories={categoriesTree} brands={allBrands} />
            </div>
          </div>

          {/* Product Listing */}
          <div className="space-y-6 lg:col-span-3">
            {/* Top Bar (Sorting + Summary) */}
            <div className="flex items-center justify-between border-b pb-4">
              <p className="text-muted-foreground text-sm font-medium">
                Hiển thị {productsList.length} sản phẩm
              </p>
              <ProductSort />
            </div>

            {/* Product Grid */}
            {productsList.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {productsList.map((product) => (
                  <Card
                    key={product.id}
                    className="group hover:border-primary/50 flex h-full flex-col gap-4 overflow-hidden py-0 transition-all hover:shadow-xl"
                  >
                    <CardHeader className="relative aspect-4/3 w-full p-0">
                      {product.images[0]?.includes("cloudinary.com") ? (
                        <CldImage
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
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
                        />
                      )}
                      <Badge className="absolute top-4 left-4 z-10 rounded-sm bg-black/70 px-3 py-1 text-white backdrop-blur-md hover:bg-black/70">
                        {tHome("model")}: {product.specs?.model ?? "Unknown"}
                      </Badge>
                    </CardHeader>

                    <CardContent className="flex grow flex-col gap-2">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-display text-foreground group-hover:text-primary line-clamp-2 text-xl leading-tight font-bold transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Specs List */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formatSpecs(product.specs).map((spec) => (
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

                    <CardFooter className="bg-muted/20 mt-auto flex items-center justify-between border-t p-6">
                      <span className="text-primary text-xl font-bold">
                        {product.isQuoteOnly
                          ? tHome("contact_price")
                          : priceFormatter.format(Number(product.price))}
                      </span>

                      <Button
                        asChild
                        size="lg"
                        className="font-bold tracking-wider uppercase"
                      >
                        <Link href={`/products/${product.slug}`}>
                          {product.isQuoteOnly
                            ? tHome("request_quote_cta")
                            : tHome("buy_now_cta")}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
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
