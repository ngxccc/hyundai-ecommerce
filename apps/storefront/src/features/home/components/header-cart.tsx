"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useCart } from "@/features/cart";
import { Link } from "@/i18n/routing";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nhatnang/ui/components/ui/popover";
import { priceFormatter } from "@/shared/lib/utils";

export function HeaderCart() {
  const t = useTranslations("Cart");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const cartItems = useCart((state) => state.items) ?? [];
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (!isMounted) {
    return (
      <div className="relative p-2" data-testid="cart-skeleton">
        <ShoppingCart className="size-6 text-zinc-600" />
        <span className="absolute top-1 right-1 flex h-4 w-4 animate-pulse rounded-full bg-zinc-200" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile View: Direct Link */}
      <Link href="/cart" className="relative p-2 md:hidden">
        <ShoppingCart className="size-6 text-zinc-600" />
        {totalCount > 0 && (
          <Badge className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-bold p-0">
            {totalCount}
          </Badge>
        )}
      </Link>

      {/* Desktop View: Popover */}
      <div className="hidden md:block">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 outline-none cursor-pointer">
              <ShoppingCart className="size-6 text-zinc-600 hover:text-zinc-900 transition-colors" />
              {totalCount > 0 && (
                <Badge className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-bold p-0">
                  {totalCount}
                </Badge>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 rounded-lg bg-background/95 border border-border shadow-lg p-4 backdrop-blur-md">
            {cartItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t("empty")}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {cartItems.slice(0, 5).map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                      <div className="relative size-10 bg-muted rounded overflow-hidden">
                        <img src={item.image !== "" ? item.image : "https://placehold.co/50x50"} alt={item.name} className="object-cover size-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground truncate">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          {item.quantity} x {priceFormatter.format(Number(item.price))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full text-xs font-bold uppercase tracking-wider h-9 rounded-md">
                  <Link href="/cart">{t("viewCart")}</Link>
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
