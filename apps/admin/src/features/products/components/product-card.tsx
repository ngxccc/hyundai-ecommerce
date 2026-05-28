"use client";

import { useTranslations } from "next-intl";
import { Edit, Trash2 } from "lucide-react";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { TProductGridItem } from "../types";

export const ProductCard = ({ product }: { product: TProductGridItem }) => {
  const t = useTranslations("AdminProducts.card");

  const status = product.totalStockCache > 0 ? "active" : "outOfStock";
  const image =
    product.images?.[0] ?? "https://placehold.co/400x300/png?text=No+Image";
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(product.price));

  return (
    <Card className="group relative flex flex-col gap-0 p-3 shadow-sm">
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant="secondary"
          className={`border-transparent font-medium ${
            status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {t(`status.${status}`)}
        </Badge>
      </div>

      <div className="bg-muted relative mb-4 aspect-4/3 overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={product.name}
          width={400}
          height={300}
          className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 dark:mix-blend-normal"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <p className="text-muted-foreground mb-1 text-xs font-medium">
          {product.slug}
        </p>
        <h3 className="text-primary mb-1 line-clamp-2 text-base font-semibold">
          {product.name}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {product.categories?.name ?? "Khác"}
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p
              className={`mb-1 text-xs ${product.totalStockCache === 0 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {t("stock", { count: String(product.totalStockCache) })}
            </p>
            <p className="text-primary text-lg font-bold">
              {product.isQuoteOnly ? t("contact") : formattedPrice}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Link href={`/products/${product.id}/edit`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 transition-colors"
                title={t("actions.edit")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/20 hover:text-destructive h-8 w-8 transition-colors"
              title={t("actions.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
