import { getLocale, getTranslations } from "next-intl/server";
import { ProductCard } from "@/features/products";
import { productService } from "@/shared/services";

export async function ProductsSection() {
  const [t, locale] = await Promise.all([
    getTranslations("HomePage.products"),
    getLocale(),
  ]);

  const { data: products } = await productService.getProducts(locale);

  if (!products?.length) return null;

  return (
    <section className="bg-background pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 border-b pb-4">
          <h2 className="font-display text-foreground text-4xl font-extrabold tracking-tighter md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-2 font-sans text-sm tracking-widest uppercase">
            {t("subtitle")}
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
