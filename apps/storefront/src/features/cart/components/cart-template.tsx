"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart, useCartStore } from "@/features/cart";
import { ProductImagePlaceholder } from "@/shared/components/product-image-placeholder";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Card, CardContent } from "@nhatnang/ui/components/ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { priceFormatter } from "@nhatnang/shared/lib/utils";
import { FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import { useRouter } from "@/i18n/routing";
import { useIsMounted } from "@/shared/hooks/useIsMounted";

export function CartTemplate() {
  const t = useTranslations("Cart");
  const isMounted = useIsMounted();
  const router = useRouter();

  const isCartSynced = useCart((state) => state.isCartSynced) ?? false;
  const cartItems = useCart((state) => state.items) ?? [];
  const { updateQuantity, removeItem } = useCartStore();

  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleInputChange = (productId: string, val: string) => {
    setInputValues((prev) => ({ ...prev, [productId]: val }));
  };

  const handleInputBlur = (
    productId: string,
    val: string,
    totalStock: number,
  ) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      void updateQuantity(productId, 1);
    } else if (parsed > totalStock) {
      void updateQuantity(productId, totalStock);
    } else {
      void updateQuantity(productId, parsed);
    }

    setInputValues((prev) => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleActionClick = () => {
    router.push("/checkout");
  };

  if (!isMounted || !isCartSynced) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12" data-testid="cart-loading">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-zinc-200" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="h-24 rounded-lg bg-zinc-200" />
              <div className="h-24 rounded-lg bg-zinc-200" />

              {/* Sticky bottom bar skeleton for mobile */}
              <div className="bg-background/95 sticky bottom-4 z-50 animate-pulse rounded-lg border border-zinc-200 p-4 shadow-lg lg:hidden">
                <div className="mb-3 space-y-2 border-b border-zinc-100 pb-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-zinc-200" />
                    <div className="h-3 w-8 rounded bg-zinc-200" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-zinc-200" />
                    <div className="h-3 w-16 rounded bg-zinc-200" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-zinc-200" />
                    <div className="h-3 w-16 rounded bg-zinc-200" />
                  </div>
                  <div className="flex justify-between border-t border-zinc-50 pt-1">
                    <div className="h-4 w-12 rounded bg-zinc-200" />
                    <div className="h-4 w-20 rounded bg-zinc-200" />
                  </div>
                </div>
                <div className="h-10 w-full rounded bg-zinc-200" />
              </div>
            </div>
            <div className="hidden h-48 rounded-lg bg-zinc-200 lg:block" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display mb-4 text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mb-8 text-lg">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:px-8">
      <h1 className="font-display mb-4 text-3xl font-bold lg:mb-8">
        {t("title")}
      </h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items List */}
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => (
            <Card
              key={item.productId}
              className="overflow-hidden rounded-lg py-0"
            >
              <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex w-full items-start gap-4 sm:contents">
                  <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded">
                    {item.image !== "" ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <ProductImagePlaceholder />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="font-display text-foreground truncate text-base font-bold">
                      {item.name}
                    </h3>
                    <p className="text-primary mt-1 text-sm font-semibold">
                      {priceFormatter.format(Number(item.price))}
                    </p>
                  </div>
                </div>
                {/* Quantity and Actions */}
                <div className="flex w-full items-center justify-between gap-4 sm:mt-0 sm:w-auto">
                  <div className="flex items-center rounded-md border border-zinc-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-none"
                      onClick={() =>
                        void updateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <input
                      type="number"
                      className="w-12 [appearance:textfield] border-0 bg-transparent p-0 text-center text-sm font-semibold focus:ring-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      value={
                        inputValues[item.productId] ?? String(item.quantity)
                      }
                      onChange={(e) =>
                        handleInputChange(item.productId, e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputBlur(
                          item.productId,
                          e.target.value,
                          item.totalStock,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      min={1}
                      max={item.totalStock}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-none"
                      onClick={() =>
                        void updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.totalStock}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-zinc-400 hover:text-red-600"
                    onClick={() => void removeItem(item.productId)}
                    aria-label="Xóa sản phẩm"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Sticky Bottom Bar for Mobile */}
          <div className="bg-background/95 sticky bottom-4 z-50 rounded-lg border border-zinc-200 p-4 shadow-lg backdrop-blur-md lg:hidden">
            <div className="mb-3 space-y-2 border-b border-zinc-100 pb-2 text-sm">
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{t("totalItems")}</span>
                <span className="text-foreground font-semibold">
                  {totalCount}
                </span>
              </div>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{t("subtotal")}</span>
                <span className="text-foreground font-semibold">
                  {priceFormatter.format(subtotal)}
                </span>
              </div>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>VAT ({FINANCIAL_CONSTANTS.VAT_RATE * 100}%)</span>
                <span className="text-foreground font-semibold">
                  {priceFormatter.format(
                    subtotal * FINANCIAL_CONSTANTS.VAT_RATE,
                  )}
                </span>
              </div>
              <div className="text-foreground flex justify-between border-t border-zinc-50 pt-1 text-sm font-bold">
                <span>{t("total")}</span>
                <span className="text-primary text-base font-extrabold">
                  {priceFormatter.format(
                    subtotal * (1 + FINANCIAL_CONSTANTS.VAT_RATE),
                  )}
                </span>
              </div>
            </div>
            <Button
              className="w-full rounded-md py-2.5 text-xs font-bold tracking-wider uppercase"
              onClick={handleActionClick}
            >
              {t("checkout")}
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="hidden lg:block">
          <Card className="gap-0 rounded-lg py-0">
            <div className="border-b border-zinc-100 px-6 py-4">
              <h2 className="font-display text-lg font-bold">{t("summary")}</h2>
            </div>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4 border-b pb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("totalItems")}
                  </span>
                  <span className="text-foreground font-semibold">
                    {totalCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span className="text-foreground font-semibold">
                    {priceFormatter.format(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    VAT ({FINANCIAL_CONSTANTS.VAT_RATE * 100}%)
                  </span>
                  <span className="text-foreground font-semibold">
                    {priceFormatter.format(
                      subtotal * FINANCIAL_CONSTANTS.VAT_RATE,
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-base font-bold">
                  {t("total")}
                </span>
                <span className="text-primary text-xl font-bold">
                  {priceFormatter.format(
                    subtotal * (1 + FINANCIAL_CONSTANTS.VAT_RATE),
                  )}
                </span>
              </div>
              <div className="space-y-3">
                <Button
                  className="h-11 w-full font-bold tracking-wider uppercase"
                  onClick={handleActionClick}
                >
                  {t("checkout")}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full border-zinc-200 font-bold tracking-wider uppercase"
                  onClick={handleActionClick}
                >
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
