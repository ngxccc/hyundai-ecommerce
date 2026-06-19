"use client";

import { useCartStore } from "@/features/cart";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: string;
  image: string;
  totalStock: number;
}

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  totalStock,
}: AddToCartButtonProps) {
  const t = useTranslations("Cart");
  const { items, addItem } = useCartStore();

  const handleAddToCart = () => {
    const existing = items.find((item) => item.productId === productId);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + 1 > totalStock) {
      toast.error(t("stockLimitExceeded", { max: String(totalStock) }));
      return;
    }

    void addItem({ productId, name, price, image, totalStock }, 1);
    toast.success(t("addedToCart", { name }));
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full gap-2 border-zinc-200 font-bold tracking-wider text-zinc-600 uppercase hover:bg-zinc-100 hover:text-zinc-900 sm:w-auto lg:w-full"
      onClick={handleAddToCart}
    >
      <Plus className="size-4" />
      {t("addToCart")}
    </Button>
  );
}
