"use client";

import { useTranslations } from "next-intl";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import Image from "next/image";

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Máy phát điện Hyundai HY-30CLE",
    sold: 124,
    price: "12.5M",
    image: "https://placehold.co/400x300/png?text=No+Image",
  },
  {
    id: 2,
    name: "Máy phát điện Hyundai HY-7000LE",
    sold: 98,
    price: "18.2M",
    image: "https://placehold.co/400x300/png?text=No+Image",
  },
  {
    id: 3,
    name: "Trạm sạc dự phòng HPgreen",
    sold: 75,
    price: "8.5M",
    image: "https://placehold.co/400x300/png?text=No+Image",
  },
  {
    id: 4,
    name: "Máy phát điện Mitsubishi",
    sold: 42,
    price: "45.0M",
    image: "https://placehold.co/400x300/png?text=No+Image",
  },
];

export const TopProducts = () => {
  const t = useTranslations("AdminDashboard.topProducts");

  return (
    <Card className="flex h-full flex-col gap-0 p-3 shadow-sm">
      <div className="border-border/50 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <h3 className="text-primary text-xl font-semibold">{t("title")}</h3>
        <Button
          variant="link"
          className="text-primary px-0 text-sm font-medium"
        >
          {t("viewAll")}
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {MOCK_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors"
          >
            <div className="border-border/50 bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded border">
              <Image
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                sizes="48px"
                fill
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-foreground truncate text-sm font-medium">
                {product.name}
              </h4>
              <p className="text-muted-foreground text-xs">
                {t("sold", { count: String(product.sold) })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary text-sm font-bold">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
