"use client";

import { useTranslations } from "next-intl";
import { Edit, Trash2 } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import Image from "next/image";

export interface ProductProps {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: string;
  image: string;
  status: "active" | "outOfStock";
  isQuoteOnly: boolean;
}

export const ProductCard = ({ product }: { product: ProductProps }) => {
  const t = useTranslations("AdminProducts.card");

  return (
    <Card className="group relative flex flex-col gap-0 p-3 shadow-sm">
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant="secondary"
          className={`border-transparent font-medium ${
            product.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {t(`status.${product.status}`)}
        </Badge>
      </div>

      <div className="bg-muted relative mb-4 aspect-4/3 overflow-hidden rounded-lg">
        <Image
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 dark:mix-blend-normal"
          width={1000}
          height={1000}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <p className="text-muted-foreground mb-1 text-xs font-medium">
          {product.sku}
        </p>
        <h3 className="text-primary mb-1 line-clamp-2 text-base font-semibold">
          {product.name}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">{product.category}</p>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p
              className={`mb-1 text-xs ${product.stock === 0 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {t("stock", { count: String(product.stock) })}
            </p>
            <p className="text-primary text-lg font-bold">
              {product.isQuoteOnly ? t("contact") : product.price}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              className="text-muted-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
              title="Sửa"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              className="text-destructive hover:bg-destructive/20 rounded-md p-1.5 transition-colors"
              title="Xóa"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
