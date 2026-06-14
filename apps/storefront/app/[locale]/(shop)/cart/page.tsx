import type { Metadata } from "next";
import { CartTemplate } from "@/features/cart/components/cart-template";

export const metadata: Metadata = {
  title: "Shopping Cart | Hyundai B2B Storefront",
  description: "Manage your shopping cart and request quotes.",
};

export default function CartPage() {
  return <CartTemplate />;
}
