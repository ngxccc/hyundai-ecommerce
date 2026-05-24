import { routing } from "@/i18n/routing";
import { priceFormatter } from "@/shared/lib/utils";
import { productService } from "@/shared/services";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

interface ProductPageParams {
  locale: string;
  slug: string;
}

export const revalidate = 3600;

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
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: product.specs.join(" • "),
  };
}

const ProductDetailsPage = async ({
  params,
}: {
  params: Promise<ProductPageParams>;
}) => {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl lg:w-1/2">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
          {product.name}
        </h1>
        <p className="text-muted-foreground text-lg">{product.model}</p>
        <div className="flex flex-wrap gap-2">
          {product.specs.map((spec) => (
            <span
              key={`${product.id}-${spec}`}
              className="bg-muted rounded-md px-3 py-1 text-sm"
            >
              {spec}
            </span>
          ))}
        </div>
        <p className="text-primary text-2xl font-semibold">
          {priceFormatter.format(product.price)}
        </p>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
