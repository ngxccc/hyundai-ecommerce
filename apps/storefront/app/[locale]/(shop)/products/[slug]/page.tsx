import { Suspense } from "react";
import { ProductDetailsSkeleton } from "@/features/products/components/skeletons/product-details-skeleton";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { StorefrontProduct } from "@/shared/services/types";
import { routing } from "@/i18n/routing";
import { priceFormatter } from "@/shared/lib/utils";
import { productService } from "@/shared/services";
import type { Metadata } from "next";
import { ImageWithSkeleton } from "@/shared/components/image-with-skeleton";
import { ProductImagePlaceholder } from "@/shared/components/product-image-placeholder";
import { notFound } from "next/navigation";
import type { Locale } from "next-intl";
import { FUEL_TYPES, PHASES } from "@nhatnang/database/validators";

interface ProductPageParams {
  locale: string;
  slug: string;
}

const formatSpecs = (specs: StorefrontProduct["specs"]): string[] => {
  if (!specs || typeof specs !== "object") return [];
  const specsObj = specs as Record<
    string,
    string | number | boolean | null | undefined
  >;
  const specsArray: string[] = [];
  if (specsObj["power"]) specsArray.push(`${String(specsObj["power"])}kW`);
  if (typeof specsObj["fuelType"] === "string") {
    specsArray.push(specsObj["fuelType"]);
  }
  return specsArray;
};

export async function generateStaticParams(): Promise<ProductPageParams[]> {
  const slugs = await productService.getStaticProductSlugs();

  if (slugs.length === 0 && process.env["CI"]) {
    console.warn(
      "CI Environment: DB empty, generating fallback slug to test layout",
    );
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
  setRequestLocale(locale as Locale);
  const product = await productService.getProductBySlug(locale as Locale, slug);

  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: formatSpecs(product.specs).join(" • "),
  };
}

const ALLOWED_SPEC_KEYS = new Set([
  "model",
  "power",
  "voltage",
  "frequency",
  "phase",
  "fuelType",
  "warranty",
  "weight",
  "engineBrand",
  "startingSystem",
  "coolingSystem",
  "fuelConsumption",
  "fuelTankCapacity",
  "alternatorBrand",
]);

const ALLOWED_FUEL_TYPES = new Set<string>(FUEL_TYPES);
const ALLOWED_PHASES = new Set<string>(PHASES);

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
  setRequestLocale(locale as Locale);
  const product = await productService.getProductBySlug(locale as Locale, slug);
  const t = await getTranslations("ProductDetails");

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl lg:w-1/2">
        {product.images[0] && product.images[0] !== "" ? (
          <ImageWithSkeleton
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            preload
          />
        ) : (
          <ProductImagePlaceholder iconClassName="size-12" />
        )}
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
          {product.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          {product.specs?.model ?? "Unknown"}
        </p>
        <div className="flex flex-wrap gap-2">
          {formatSpecs(product.specs).map((spec) => (
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

        {/* Bảng thông số chi tiết */}
        <div className="mt-6 border-t pt-6">
          <h2 className="text-foreground mb-4 text-lg font-bold">
            {t("detailedSpecs")}
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {Object.entries(
              (product.specs as Record<
                string,
                string | number | boolean | null | undefined
              >) || {},
            ).map(([key, value]) => {
              if (value === null || value === undefined || value === "")
                return null;

              if (!ALLOWED_SPEC_KEYS.has(key)) return null;
              const label = t(`specs.${key}` as never);

              let displayValue = String(value);
              if (key === "fuelType" && typeof value === "string") {
                displayValue = ALLOWED_FUEL_TYPES.has(value)
                  ? t(`fuelTypes.${value}` as never)
                  : String(value);
              } else if (key === "phase" && typeof value === "string") {
                displayValue = ALLOWED_PHASES.has(value)
                  ? t(`phases.${value}` as never)
                  : String(value);
              }

              return (
                <div
                  key={key}
                  className="flex justify-between border-b pb-2 text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-semibold">
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
