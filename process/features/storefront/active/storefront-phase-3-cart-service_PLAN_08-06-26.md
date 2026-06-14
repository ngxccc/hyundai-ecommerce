# Storefront Cart UI Integration - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the client-side cart UI (Header Popover, Add to Cart buttons, and dedicated Cart Page) for the B2B Storefront application using Zustand, Radix UI, and Sonner toasts.

**Architecture:** A client-first, hydration-safe UI flow. Subscribes to the Zustand client store using a deferred mount check to prevent hydration mismatch, displays skeleton loaders for stable page layouts, and locks quantity selections based on product stock cache limits.

**Tech Stack:** React 19, Next.js 16 (App Router), Zustand (persist), Radix UI Popover, Tailwind CSS v4, Sonner.

---

## File Structure

- **Create**:
  - `apps/storefront/src/features/products/components/add-to-cart-button.tsx` (Catalog card Add to Cart button)
  - `apps/storefront/src/features/products/components/__tests__/add-to-cart-button.test.tsx` (Unit tests)
  - `apps/storefront/src/features/home/components/header-cart.tsx` (Header Cart Icon & Popover component)
  - `apps/storefront/src/features/home/components/__tests__/header-cart.test.tsx` (Unit tests)
  - `apps/storefront/src/features/cart/components/cart-template.tsx` (Cart Page template)
  - `apps/storefront/src/features/cart/components/__tests__/cart-template.test.tsx` (Unit tests)
  - `apps/storefront/app/[locale]/(shop)/cart/page.tsx` (Dedicated Cart Page route)

- **Modify**:
  - `apps/storefront/src/features/products/components/catalog-template.tsx` (Catalog grid integration)
  - `apps/storefront/src/features/home/components/header.tsx` (Header icon placement)
  - `apps/storefront/messages/en.json` (English cart locales)
  - `apps/storefront/messages/vi.json` (Vietnamese cart locales)

---

## Tasks

### Task 1: Add translation keys for Cart UI

**Files:**

- Modify: `apps/storefront/messages/en.json`
- Modify: `apps/storefront/messages/vi.json`

- [ ] **Step 1: Update English messages**
      Add keys inside the JSON structure under `"Cart"` namespace.
      Modify `apps/storefront/messages/en.json`:

  ```json
  "Cart": {
    "title": "Your Cart",
    "empty": "Your cart is empty",
    "viewCart": "View Full Cart",
    "addToCart": "Add to Cart",
    "addedToCart": "Added {name} to cart",
    "stockLimitExceeded": "Cannot add more items. Maximum stock reached ({max})",
    "checkout": "Proceed to Checkout",
    "quote": "Request Quote",
    "comingSoon": "Checkout and quoting features are coming soon in Phase 4.",
    "summary": "Order Summary",
    "itemsCount": "{count, plural, =0 {0 items} =1 {1 item} other {# items}}",
    "remove": "Remove"
  }
  ```

- [ ] **Step 2: Update Vietnamese messages**
      Modify `apps/storefront/messages/vi.json`:

  ```json
  "Cart": {
    "title": "Giỏ hàng của bạn",
    "empty": "Giỏ hàng trống",
    "viewCart": "Xem giỏ hàng",
    "addToCart": "Thêm vào giỏ",
    "addedToCart": "Đã thêm {name} vào giỏ hàng",
    "stockLimitExceeded": "Không thể thêm. Đã đạt giới hạn tồn kho ({max})",
    "checkout": "Tiến hành thanh toán",
    "quote": "Yêu cầu báo giá",
    "comingSoon": "Tính năng thanh toán và báo giá đang được phát triển ở Phase 4.",
    "summary": "Tóm tắt đơn hàng",
    "itemsCount": "{count} sản phẩm",
    "remove": "Xóa"
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add apps/storefront/messages/en.json apps/storefront/messages/vi.json
  git commit -m "chore(storefront): add localization keys for cart ui"
  ```

---

### Task 2: AddToCartButton Component

**Files:**

- Create: `apps/storefront/src/features/products/components/add-to-cart-button.tsx`
- Create: `apps/storefront/src/features/products/components/__tests__/add-to-cart-button.test.tsx`

- [ ] **Step 1: Write unit tests first**
      Create `apps/storefront/src/features/products/components/__tests__/add-to-cart-button.test.tsx`:

  ```tsx
  import { describe, it, expect, vi } from "vitest";
  import { render, screen, fireEvent } from "@testing-library/react";
  import { AddToCartButton } from "../add-to-cart-button";
  import { NextIntlClientProvider } from "next-intl";

  const messages = {
    Cart: {
      addToCart: "Add to Cart",
      addedToCart: "Added {name} to cart",
      stockLimitExceeded:
        "Cannot add more items. Maximum stock reached ({max})",
    },
  };

  vi.mock("@/features/cart", () => ({
    useCartStore: () => ({
      items: [],
      addItem: vi.fn(),
    }),
  }));

  vi.mock("sonner", () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }));

  describe("AddToCartButton", () => {
    it("renders successfully", () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <AddToCartButton
            productId="prod-1"
            name="Generator"
            price="1000"
            image="/gen.jpg"
            totalStock={10}
          />
        </NextIntlClientProvider>,
      );
      expect(screen.getByText("Add to Cart")).toBeDefined();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails/passes mocks**
      Run: `bun test apps/storefront/src/features/products/components/__tests__/add-to-cart-button.test.tsx`
      Expected: FAIL with component file missing.

- [ ] **Step 3: Write component implementation**
      Create `apps/storefront/src/features/products/components/add-to-cart-button.tsx`:

  ```tsx
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
        toast.error(t("stockLimitExceeded", { max: totalStock }));
        return;
      }

      addItem({ productId, name, price, image, totalStock }, 1);
      toast.success(t("addedToCart", { name }));
    };

    return (
      <Button
        variant="outline"
        size="lg"
        className="gap-2 border-zinc-200 font-bold tracking-wider text-zinc-600 uppercase hover:bg-zinc-100 hover:text-zinc-900 lg:w-full"
        onClick={handleAddToCart}
      >
        <Plus className="size-4" />
        {t("addToCart")}
      </Button>
    );
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
      Run: `bun test apps/storefront/src/features/products/components/__tests__/add-to-cart-button.test.tsx`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add apps/storefront/src/features/products/components/add-to-cart-button.tsx apps/storefront/src/features/products/components/__tests__/add-to-cart-button.test.tsx
  git commit -m "feat(storefront): implement AddToCartButton component"
  ```

---

### Task 3: Integrate AddToCartButton in Catalog Template

**Files:**

- Modify: `apps/storefront/src/features/products/components/catalog-template.tsx`

- [ ] **Step 1: Render AddToCartButton next to Buy Now**
      Modify `apps/storefront/src/features/products/components/catalog-template.tsx:299-310`:

  ```tsx
  // Add import at top
  import { AddToCartButton } from "./add-to-cart-button";

  // Replace inside productsList.map footer:
  <CardFooter className="bg-muted/20 mt-auto flex items-center justify-between gap-2 border-t p-4 pt-4! lg:flex-col">
    <span className="text-primary font-mono text-xl font-bold">
      {product.isQuoteOnly
        ? tHome("contact_price")
        : priceFormatter.format(Number(product.price))}
    </span>

    <div className="flex w-full items-center gap-2 lg:flex-col">
      <Button
        asChild
        size="lg"
        className="font-bold tracking-wider uppercase lg:w-full"
      >
        <Link href={`/products/${product.slug}`}>
          {product.isQuoteOnly
            ? tHome("request_quote_cta")
            : tHome("buy_now_cta")}
        </Link>
      </Button>

      {!product.isQuoteOnly && (
        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={product.price}
          image={product.images?.[0] ?? ""}
          totalStock={product.totalStockCache}
        />
      )}
    </div>
  </CardFooter>;
  ```

- [ ] **Step 2: Verify lint and compilation**
      Run: `bun run check-types`
      Expected: Clean compilation with no errors.

- [ ] **Step 3: Commit**
  ```bash
  git add apps/storefront/src/features/products/components/catalog-template.tsx
  git commit -m "feat(storefront): render AddToCartButton on product catalog page"
  ```

---

### Task 4: Header Cart Component

**Files:**

- Create: `apps/storefront/src/features/home/components/header-cart.tsx`
- Create: `apps/storefront/src/features/home/components/__tests__/header-cart.test.tsx`

- [ ] **Step 1: Write unit tests first**
      Create `apps/storefront/src/features/home/components/__tests__/header-cart.test.tsx`:

  ```tsx
  import { describe, it, expect, vi } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { HeaderCart } from "../header-cart";
  import { NextIntlClientProvider } from "next-intl";

  const messages = {
    Cart: {
      empty: "Your cart is empty",
      viewCart: "View Full Cart",
    },
  };

  vi.mock("@/features/cart", () => ({
    useCart: (selector: any) => {
      const state = {
        items: [],
        isOpen: false,
      };
      return selector(state);
    },
  }));

  describe("HeaderCart", () => {
    it("renders loading skeleton before mount", () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <HeaderCart />
        </NextIntlClientProvider>,
      );
      expect(screen.getByTestId("cart-skeleton")).toBeDefined();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `bun test apps/storefront/src/features/home/components/__tests__/header-cart.test.tsx`
      Expected: FAIL with missing component file.

- [ ] **Step 3: Write component implementation**
      Create `apps/storefront/src/features/home/components/header-cart.tsx`:

  ```tsx
  "use client";

  import { useState, useEffect } from "react";
  import { useCart, type CartItem } from "@/features/cart";
  import { Link } from "@/i18n/routing";
  import { ShoppingCart } from "lucide-react";
  import { useTranslations } from "next-intl";
  import { Badge } from "@nhatnang/ui/components/ui/badge";
  import { Button } from "@nhatnang/ui/components/ui/button";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@nhatnang/ui/components/ui/popover";
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
            <Badge className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 font-mono text-[9px] font-bold">
              {totalCount}
            </Badge>
          )}
        </Link>

        {/* Desktop View: Popover */}
        <div className="hidden md:block">
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative cursor-pointer p-2 outline-none">
                <ShoppingCart className="size-6 text-zinc-600 transition-colors hover:text-zinc-900" />
                {totalCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 font-mono text-[9px] font-bold">
                    {totalCount}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="bg-background/95 border-border w-80 rounded-lg border p-4 shadow-lg backdrop-blur-md">
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
                          <img
                            src={
                              item.image !== ""
                                ? item.image
                                : "https://placehold.co/50x50"
                            }
                            alt={item.name}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-foreground truncate text-xs font-semibold">
                            {item.name}
                          </h4>
                          <p className="text-muted-foreground font-mono text-[10px]">
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
  ```

- [ ] **Step 4: Run test to verify it passes**
      Run: `bun test apps/storefront/src/features/home/components/__tests__/header-cart.test.tsx`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add apps/storefront/src/features/home/components/header-cart.tsx apps/storefront/src/features/home/components/__tests__/header-cart.test.tsx
  git commit -m "feat(storefront): implement HeaderCart component with popover"
  ```

---

### Task 5: Integrate HeaderCart in Header

**Files:**

- Modify: `apps/storefront/src/features/home/components/header.tsx`

- [ ] **Step 1: Render HeaderCart in Header actions**
      Modify `apps/storefront/src/features/home/components/header.tsx`:

  ```tsx
  // Add import at top
  import { HeaderCart } from "./header-cart";

  // Replace inside actions container:
  <div className="flex items-center gap-4">
    <HeaderCart />

    {/* Desktop Actions */}
    <div className="hidden items-center gap-3 md:flex">
  ```

- [ ] **Step 2: Verify compile and lint**
      Run: `bun run check-types`
      Expected: Clean compilation with 0 errors.

- [ ] **Step 3: Commit**
  ```bash
  git add apps/storefront/src/features/home/components/header.tsx
  git commit -m "feat(storefront): integrate HeaderCart in main header"
  ```

---

### Task 6: Cart Template UI Component

**Files:**

- Create: `apps/storefront/src/features/cart/components/cart-template.tsx`
- Create: `apps/storefront/src/features/cart/components/__tests__/cart-template.test.tsx`

- [ ] **Step 1: Write unit tests first**
      Create `apps/storefront/src/features/cart/components/__tests__/cart-template.test.tsx`:

  ```tsx
  import { describe, it, expect, vi } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { CartTemplate } from "../cart-template";
  import { NextIntlClientProvider } from "next-intl";

  const messages = {
    Cart: {
      title: "Your Cart",
      empty: "Your cart is empty",
      summary: "Order Summary",
      checkout: "Proceed to Checkout",
      quote: "Request Quote",
    },
  };

  vi.mock("@/features/cart", () => ({
    useCart: (selector: any) => {
      const state = {
        items: [],
      };
      return selector(state);
    },
    useCartStore: () => ({
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
    }),
  }));

  describe("CartTemplate", () => {
    it("renders empty cart state successfully", () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <CartTemplate />
        </NextIntlClientProvider>,
      );
      expect(screen.getByText("Your cart is empty")).toBeDefined();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `bun test apps/storefront/src/features/cart/components/__tests__/cart-template.test.tsx`
      Expected: FAIL with missing component file.

- [ ] **Step 3: Write component implementation**
      Create `apps/storefront/src/features/cart/components/cart-template.tsx`:

  ```tsx
  "use client";

  import { useState, useEffect } from "react";
  import { useCart, useCartStore } from "@/features/cart";
  import { Button } from "@nhatnang/ui/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
  } from "@nhatnang/ui/components/ui/card";
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

    const subtotal = cartItems.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0,
    );

    const handleActionClick = () => {
      toast.info(t("comingSoon"));
    };

    if (!isMounted) {
      return (
        <div
          className="mx-auto max-w-7xl px-6 py-12"
          data-testid="cart-loading"
        >
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-zinc-200" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="h-24 rounded-lg bg-zinc-200" />
                <div className="h-24 rounded-lg bg-zinc-200" />
              </div>
              <div className="h-48 rounded-lg bg-zinc-200" />
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
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display mb-8 text-3xl font-bold">{t("title")}</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items List */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.productId} className="overflow-hidden rounded-lg">
                <CardContent className="flex flex-col items-center gap-6 p-4 sm:flex-row">
                  <div className="bg-muted relative h-20 w-20 overflow-hidden rounded">
                    <img
                      src={
                        item.image !== ""
                          ? item.image
                          : "https://placehold.co/100x100/png?text=No+Image"
                      }
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <h3 className="font-display text-foreground truncate text-base font-bold">
                      {item.name}
                    </h3>
                    <p className="text-primary mt-1 font-mono text-sm font-semibold">
                      {priceFormatter.format(Number(item.price))}
                    </p>
                  </div>
                  {/* Quantity and Actions */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-md border border-zinc-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-none"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-10 text-center font-mono text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-none"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
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
                <h2 className="font-display text-lg font-bold">
                  {t("summary")}
                </h2>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-muted-foreground text-sm font-medium">
                    {t("title")}
                  </span>
                  <span className="font-mono text-lg font-bold">
                    {priceFormatter.format(subtotal)}
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
  ```

- [ ] **Step 4: Run test to verify it passes**
      Run: `bun test apps/storefront/src/features/cart/components/__tests__/cart-template.test.tsx`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add apps/storefront/src/features/cart/components/cart-template.tsx apps/storefront/src/features/cart/components/__tests__/cart-template.test.tsx
  git commit -m "feat(storefront): implement CartTemplate component with items list and summary"
  ```

---

### Task 7: Dedicated Cart Route Page

**Files:**

- Create: `apps/storefront/app/[locale]/(shop)/cart/page.tsx`

- [ ] **Step 1: Create the cart page route**
      Create `apps/storefront/app/[locale]/(shop)/cart/page.tsx`:

  ```tsx
  import { Metadata } from "next";
  import { CartTemplate } from "@/features/cart/components/cart-template";

  export const metadata: Metadata = {
    title: "Shopping Cart | Hyundai B2B Storefront",
    description: "Manage your shopping cart and request quotes.",
  };

  export default function CartPage() {
    return <CartTemplate />;
  }
  ```

- [ ] **Step 2: Run final compilation and lint verification**
      Run: `bun run check-types && bun run lint`
      Expected: Success without any typescript errors or linter warnings.

- [ ] **Step 3: Commit**
  ```bash
  git add apps/storefront/app/[locale]/(shop)/cart/page.tsx
  git commit -m "feat(storefront): create dedicated /cart page route"
  ```
