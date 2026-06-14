"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ProductImagePlaceholder } from "@/shared/components/product-image-placeholder";
import { useCart } from "@/features/cart";
import { useIsMounted } from "@/shared/hooks/useIsMounted";
import { Link } from "@/i18n/routing";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@nhatnang/ui/components/ui/popover";
import { priceFormatter } from "@/shared/lib/utils";

export function HeaderCart() {
  const t = useTranslations("Cart");
  const isMounted = useIsMounted();

  const cartItems = useCart((state) => state.items) ?? [];
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleClose = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

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
          <Badge className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 font-mono text-[9px] font-bold">
            {totalCount}
          </Badge>
        )}
      </Link>

      {/* Desktop View: Popover */}
      <div className="hidden md:block">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverAnchor asChild>
            <Link
              href="/cart"
              className="relative block cursor-pointer p-2 outline-none"
              onMouseEnter={handleOpen}
              onMouseLeave={handleClose}
              onClick={() => setIsOpen(false)}
            >
              <ShoppingCart className="size-6 text-zinc-600 transition-colors hover:text-zinc-900" />
              {totalCount > 0 && (
                <Badge className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 font-mono text-[9px] font-bold">
                  {totalCount}
                </Badge>
              )}
            </Link>
          </PopoverAnchor>
          <PopoverContent
            className="bg-background/95 border-border w-80 rounded-lg border p-4 shadow-lg backdrop-blur-md"
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
          >
            {cartItems.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                {t("empty")}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 space-y-3 overflow-y-auto">
                  {cartItems.slice(0, 5).map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 border-b border-zinc-100 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="bg-muted relative size-10 overflow-hidden rounded">
                        {item.image !== "" ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <ProductImagePlaceholder showText={false} iconClassName="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-foreground truncate text-xs font-semibold">
                          {item.name}
                        </h4>
                        <p className="text-muted-foreground text-[10px]">
                          {item.quantity} x{" "}
                          {priceFormatter.format(Number(item.price))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  className="h-9 w-full rounded-md text-xs font-bold tracking-wider uppercase"
                >
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
