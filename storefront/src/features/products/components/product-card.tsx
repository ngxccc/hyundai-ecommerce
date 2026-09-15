"use client";

import { Link, useRouter } from "@/i18n/routing";
import { FilePlus, Send } from "lucide-react";
import { useQuoteStore } from "@/features/quote";
import { ProductImage } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  if (specsObj.power) specsArray.push(`${String(specsObj.power)}kW`);
  if (typeof specsObj.fuelType === "string") {
    const fuelType = specsObj.fuelType;
    if (
      fuelType === "gasoline" ||
      fuelType === "diesel" ||
      fuelType === "gas"
    ) {
      // Safely pass to translator
      specsArray.push(tProduct(`fuelTypes.${fuelType}`));
    }
  }
  if (typeof specsObj.phase === "string") {
    const phase = specsObj.phase;
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
    toast.success(tQuote("addedSuccess", { name: product.name }));
  };
  return (
    <Card
      size="dense"
      className="group hover:border-primary/50 h-full gap-4 overflow-hidden transition-all hover:shadow-xl"
    >
      <Link href={`/products/${product.slug}`}>
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

      <CardContent className="flex grow flex-col gap-2 p-4 pt-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-foreground group-hover:text-primary line-clamp-2 text-base leading-snug font-bold transition-colors">
            {product.name}
          </h3>
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

      <CardFooter className="bg-muted/10 mt-auto flex flex-col gap-2.5 border-t p-3.5">
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
