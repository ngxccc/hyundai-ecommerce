"use client";

import { Link, useRouter } from "@/i18n/routing";
import { useCartStore } from "@/features/cart";
import { ImageWithSkeleton } from "@/shared/components/image-with-skeleton";
import { ProductImagePlaceholder } from "@/shared/components/product-image-placeholder";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@nhatnang/ui/components/ui/card";
import { AddToCartButton } from "./add-to-cart-button";
import type { StorefrontProduct } from "@/shared/services";
import { priceFormatter } from "@nhatnang/shared/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface ProductCardProps {
  product: StorefrontProduct;
  index: number;
}

const formatSpecs = (
  specs: StorefrontProduct["specs"],
  tProduct: (key: string) => string,
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
      // Safely pass to translator
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

export function ProductCard({ product, index }: ProductCardProps) {
  const router = useRouter();
  const t = useTranslations("Catalog");
  const tHome = useTranslations("HomePage.products");
  const tProduct = useTranslations("ProductDetails");
  const tCart = useTranslations("Cart");

  const { items, addItem } = useCartStore();

  const handleBuyNow = (e: React.MouseEvent) => {
    if (product.isQuoteOnly) {
      // Let the default link handle navigation for quote-only products
      return;
    }

    e.preventDefault();

    const existing = items.find((item) => item.productId === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + 1 > product.totalStockCache) {
      toast.error(
        tCart("stockLimitExceeded", { max: String(product.totalStockCache) }),
      );
      return;
    }

    // Add item to cart with quantity 1
    void addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? "",
        totalStock: product.totalStockCache,
      },
      1,
    );

    // Redirect directly to checkout
    router.push("/checkout");
  };

  return (
    <Card className="group hover:border-primary/50 flex h-full flex-col gap-4 overflow-hidden py-0 transition-all hover:shadow-xl">
      <Link href={`/products/${product.slug}`}>
        <CardHeader className="relative aspect-4/3 w-full p-0">
          {product.images?.[0] && product.images[0] !== "" ? (
            <ImageWithSkeleton
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 250px"
              className="object-cover transition-all duration-300 group-hover:scale-105"
              loading={index < 3 ? "eager" : "lazy"}
              preload={index < 3}
            />
          ) : (
            <ProductImagePlaceholder />
          )}
          <Badge className="absolute top-4 left-4 z-10 rounded-sm bg-black/70 px-3 py-1 text-white backdrop-blur-md hover:bg-black/70">
            {tHome("model")}: {product.specs?.model ?? t("unknown")}
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
          {formatSpecs(product.specs, (key) =>
            tProduct(key as Parameters<typeof tProduct>[0]),
          ).map((spec) => (
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

      <CardFooter className="bg-muted/20 mt-auto flex flex-col items-stretch gap-3 border-t p-4 pt-4! sm:flex-row sm:items-center sm:justify-between sm:gap-2 lg:flex-col lg:items-stretch">
        <span className="text-primary text-center text-xl font-bold sm:text-left lg:text-center">
          {product.isQuoteOnly
            ? tHome("contactPrice")
            : priceFormatter.format(Number(product.price))}
        </span>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:w-full lg:flex-col">
          <Button
            asChild
            size="lg"
            className="w-full font-bold tracking-wider uppercase sm:w-auto lg:w-full"
            onClick={handleBuyNow}
          >
            <Link
              href={
                product.isQuoteOnly ? `/products/${product.slug}` : "/checkout"
              }
            >
              {product.isQuoteOnly
                ? tHome("requestQuoteCta")
                : tHome("buyNowCta")}
            </Link>
          </Button>

          {!product.isQuoteOnly && (
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={product.price}
              image={product.images?.[0] ?? ""}
              totalStock={product.totalStockCache}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
