"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useCart, useCartStore } from "@/features/cart";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Card, CardContent, CardHeader } from "@nhatnang/ui/components/ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { priceFormatter } from "@/shared/lib/utils";
import { toast } from "sonner";

export function CartTemplate() {
  const t = useTranslations("Cart");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const cartItems = useCart((state) => state.items) ?? [];
  const { updateQuantity, removeItem } = useCartStore();

  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

  const handleActionClick = () => {
    toast.info(t("comingSoon"));
  };

  if (!isMounted) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12" data-testid="cart-loading">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-zinc-200 rounded" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-24 bg-zinc-200 rounded-lg" />
              <div className="h-24 bg-zinc-200 rounded-lg" />
            </div>
            <div className="h-48 bg-zinc-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground text-lg mb-8">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">{t("title")}</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.productId} className="overflow-hidden rounded-lg">
              <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-4">
                <div className="relative h-20 w-20 bg-muted rounded overflow-hidden">
                  <img src={item.image !== "" ? item.image : "https://placehold.co/100x100"} alt={item.name} className="object-cover size-full" />
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h3 className="font-display text-base font-bold text-foreground truncate">{item.name}</h3>
                  <p className="text-primary text-sm font-semibold mt-1">
                    {priceFormatter.format(Number(item.price))}
                  </p>
                </div>
                {/* Quantity and Actions */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-zinc-200 rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-none"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-10 text-center font-mono text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-none"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.totalStock}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-red-600 size-8"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="rounded-lg">
            <CardHeader className="border-b border-zinc-100 p-6">
              <h2 className="font-display text-lg font-bold">{t("summary")}</h2>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-muted-foreground text-sm font-medium">{t("summary")}</span>
                <span className="text-lg font-bold">{priceFormatter.format(subtotal)}</span>
              </div>
              <div className="space-y-3">
                <Button className="w-full font-bold uppercase tracking-wider h-11" onClick={handleActionClick}>
                  {t("checkout")}
                </Button>
                <Button variant="outline" className="w-full font-bold uppercase tracking-wider h-11 border-zinc-200" onClick={handleActionClick}>
                  {t("quote")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
