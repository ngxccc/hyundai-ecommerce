import type { TProduct } from "@nhatnang/database/schemas";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { ImageWithSkeleton } from "@/shared/components/image-with-skeleton";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@nhatnang/ui/components/ui/card";
import { productService } from "@/shared/services";
import { priceFormatter } from "@/shared/lib/utils";

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

export async function ProductsSection() {
  const t = await getTranslations("HomePage.products");

  const { data: products } = await productService.getProducts();

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
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:border-primary/50 flex h-full flex-col gap-4 overflow-hidden py-0 transition-all hover:shadow-xl"
            >
              <CardHeader className="relative aspect-4/3 w-full p-0">
                <ImageWithSkeleton
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
                <Badge className="absolute top-4 left-4 z-10 rounded-sm bg-black/70 px-3 py-1 text-white backdrop-blur-md hover:bg-black/70">
                  {t("model")}: {product.specs?.model ?? "Unknown"}
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
                    ? t("contact_price")
                    : priceFormatter.format(Number(product.price))}
                </span>

                <Button
                  asChild
                  size="lg"
                  className="font-bold tracking-wider uppercase"
                >
                  <Link href={`/products/${product.slug}`}>
                    {product.isQuoteOnly
                      ? t("request_quote_cta")
                      : t("buy_now_cta")}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
