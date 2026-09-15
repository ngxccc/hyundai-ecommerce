"use client";

import { Link, useRouter } from "@/i18n/routing";
import { FilePlus, Send } from "lucide-react";
import { useQuoteStore } from "@/features/quote";
import { ProductImage } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { StorefrontProduct } from "@/services";
import { priceFormatter } from "@/lib/utils";
import { useTranslations } from "next-intl";

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

  const rawPower = specsObj.power ?? specsObj.powerKw ?? specsObj.powerKva;
  if (typeof rawPower === "number" || typeof rawPower === "string") {
    specsArray.push(`${rawPower}kW`);
  }

  const fuelType = specsObj.fuelType;
  if (typeof fuelType === "string" && fuelType.trim().length > 0) {
    specsArray.push(tProduct(`fuelTypes.${fuelType}`));
  }

  const phase = specsObj.phase;
  if (typeof specsObj.phase === "string") {
    if (phase === "1phase" || phase === "3phase") {
      specsArray.push(tProduct(`phases.${phase}`));
    }
  }
  return specsArray;
};

export function ProductCard({ product, index }: ProductCardProps) {
  const router = useRouter();
  const tHome = useTranslations("HomePage.products");
  const tProduct = useTranslations("ProductDetails");
  const tQuote = useTranslations("Quote");
  const { addItem } = useQuoteStore();

  const handleQuoteNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? "",
        totalStock: product.totalStockCache,
      },
      1,
    );
    router.push("/quote");
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? "",
        totalStock: product.totalStockCache,
      },
      1,
    );
  };

  const specsList = formatSpecs(product.specs, (key) =>
    tProduct(key as Parameters<typeof tProduct>[0]),
  );

  return (
    <Card
      size="dense"
      className="group hover:border-primary/50 flex h-full flex-col overflow-hidden transition-all hover:shadow-xl"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <CardHeader className="relative aspect-4/3 w-full p-0">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 250px"
            className="object-cover transition-all duration-300 group-hover:scale-105"
            loading={index < 3 ? "eager" : "lazy"}
            preload={index < 3}
            showText
          />
          {typeof product.specs?.model === "string" &&
            product.specs.model.trim().length > 0 && (
              <Badge className="absolute top-3 left-3 z-10 rounded-sm bg-black/75 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-md">
                {tHome("model")}: {product.specs.model}
              </Badge>
            )}
        </CardHeader>
      </Link>

      <CardContent className="flex grow flex-col p-4">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-display text-foreground group-hover:text-primary line-clamp-2 text-base leading-snug font-bold transition-colors">
            {product.name}
          </h3>
        </Link>
        {/* Specs List - only render if specs exist */}
        {specsList.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {specsList.map((spec) => (
              <Badge
                variant="secondary"
                key={`${product.id}-${spec}`}
                className="rounded-xs text-[12px] font-medium"
              >
                {spec}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter
        size="dense"
        className="bg-muted/10 mt-auto flex flex-col gap-2.5 border-t p-3"
      >
        <div className="flex w-full items-baseline justify-between gap-2">
          <span className="text-primary text-base font-bold tracking-tight">
            {product.isQuoteOnly
              ? tHome("contactPrice")
              : priceFormatter.format(Number(product.price))}
          </span>
        </div>

        <div className="flex w-full items-center gap-1.5">
          <Button
            size="sm"
            className="flex-1 gap-1.5 text-xs font-semibold tracking-wider uppercase shadow-xs"
            onClick={handleQuoteNow}
          >
            <Send className="size-3.5" />
            {tQuote("quoteNow")}
          </Button>

          {!product.isQuoteOnly && (
            <Button
              variant="outline"
              size="icon"
              title={tQuote("addToList")}
              className="text-muted-foreground hover:text-primary hover:border-primary/50 size-8 shrink-0"
              onClick={handleAddToList}
            >
              <FilePlus className="size-3.5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
