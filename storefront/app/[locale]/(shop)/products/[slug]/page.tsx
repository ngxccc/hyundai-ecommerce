import { Suspense } from "react";
import { ProductDetailsSkeleton } from "@/features/products/components/skeletons/product-details-skeleton";
import { getTranslations } from "next-intl/server";
import type { StorefrontProduct } from "@/services/types";
import { routing } from "@/i18n/routing";
import { priceFormatter } from "@/lib/utils";
import { productService } from "@/services";
import type { Metadata } from "next";
import { ProductImage } from "@/components";
import { notFound } from "next/navigation";
import type { Locale } from "next-intl";
import { AddToQuoteButton } from "@/features/quote";

interface ProductPageParams {
  locale: string;
  slug: string;
}

const formatProductSpecs = (product: StorefrontProduct): string[] => {
  const specsArray: string[] = [];
  const rawPower = product.powerKw ?? product.powerKva;
  if (rawPower) specsArray.push(`${rawPower}kW`);
  if (product.fuelType) specsArray.push(product.fuelType);
  if (product.phase) specsArray.push(product.phase);
  return specsArray;
};
export async function generateStaticParams(): Promise<ProductPageParams[]> {
  const slugs = await productService.getStaticProductSlugs();

  if (slugs.length === 0) {
    return routing.locales.flatMap((locale) => [
      { locale, slug: "fallback-test-product" },
    ]);
  }

  // Auto added env by Github Action
  // if (process.env["CI"]) {
  //   console.log(`[CI Mode] Truncating ${slugs.length} SKUs down to 10 for fast dry-run build`);
  //   slugs = slugs.slice(0, 10);
  // }

  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ProductPageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await productService.getProductBySlug(locale as Locale, slug);

  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: formatProductSpecs(product).join(" • "),
  };
}
export default function ProductDetailsPage({
  params,
}: {
  params: Promise<ProductPageParams>;
}) {
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsPageContent params={params} />
    </Suspense>
  );
}

async function ProductDetailsPageContent({
  params,
}: {
  params: Promise<ProductPageParams>;
}) {
  const { locale, slug } = await params;
  const product = await productService.getProductBySlug(locale as Locale, slug);
  const t = await getTranslations("ProductDetails");

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl lg:w-1/2">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          preload
          showText
          iconClassName="size-12"
        />
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
          {product.name}
        </h1>
        {product.specSheet && (
          <p className="text-muted-foreground text-lg">
            {product.specSheet
              .flatMap((g) => g.items)
              .find((i) => i.key === "model")?.value ?? ""}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {formatProductSpecs(product).map((spec) => (
            <span
              key={`${product.id}-${spec}`}
              className="bg-muted rounded-md px-3 py-1 text-sm font-semibold"
            >
              {spec}
            </span>
          ))}
        </div>
        <p className="text-primary text-2xl font-bold">
          {product.isQuoteOnly
            ? t("contactForQuote")
            : priceFormatter.format(Number(product.price))}
        </p>

        <div className="mt-2">
          <AddToQuoteButton
            productId={product.id}
            name={product.name}
            price={product.price}
            image={product.images[0] ?? ""}
            totalStock={product.totalStockCache}
          />
        </div>
        {/* Technical specifications table */}
        <div className="mt-6 border-t pt-6">
          <h2 className="text-foreground mb-4 text-lg font-bold">
            {t("detailedSpecs")}
          </h2>
          {product.specSheet && product.specSheet.length > 0 ? (
            <div className="space-y-6">
              {product.specSheet.map((group) => (
                <div
                  key={group.groupKey || group.titleVi}
                  className="bg-card rounded-lg border p-4 shadow-2xs"
                >
                  <h3 className="text-primary mb-3 border-b pb-2 text-sm font-bold">
                    {locale === "en" && group.titleEn
                      ? group.titleEn
                      : group.titleVi}
                  </h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {group.items.map((item) => {
                      if (!item.value) return null;
                      const label =
                        locale === "en" && item.nameEn
                          ? item.nameEn
                          : item.nameVi;
                      const displayVal = item.unit
                        ? `${item.value} ${item.unit}`
                        : item.value;
                      return (
                        <div
                          key={item.key || item.nameVi}
                          className="flex justify-between border-b pb-1.5 text-sm"
                        >
                          <span className="text-muted-foreground">{label}</span>
                          <span className="text-foreground font-semibold">
                            {displayVal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {product.powerKva && (
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="text-muted-foreground">Công suất (kVA)</span>
                  <span className="text-foreground font-semibold">
                    {product.powerKva} kVA
                  </span>
                </div>
              )}
              {product.voltage && (
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="text-muted-foreground">Điện áp</span>
                  <span className="text-foreground font-semibold">
                    {product.voltage}
                  </span>
                </div>
              )}
              {product.fuelType && (
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="text-muted-foreground">Nhiên liệu</span>
                  <span className="text-foreground font-semibold">
                    {product.fuelType}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
