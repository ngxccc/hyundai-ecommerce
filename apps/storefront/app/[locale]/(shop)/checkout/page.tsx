import { getCachedSession } from "@/shared/lib/session";
import {
  addressService,
  cartService,
  userService,
} from "@nhatnang/database/services";
import { redirect } from "@/i18n/routing";
import { CheckoutTemplate } from "@/features/checkout/components/checkout-template";
import { FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import type { Locale } from "next-intl";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  const session = await getCachedSession();

  if (!session?.user) {
    redirect({
      href: `/login?callbackUrl=${encodeURIComponent("/checkout")}`,
      locale,
    });
    return null;
  }

  // Check if cart has items on the server to prevent checking out an empty cart
  const cart = await cartService.getOrCreateCart(session.user.id);
  const items = await cartService.getCartItems(cart.id);
  if (items.length === 0) {
    redirect({
      href: "/cart",
      locale,
    });
    return null;
  }

  const [addresses, user] = await Promise.all([
    addressService.getByUserId(session.user.id),
    userService.getB2BProfile(session.user.id),
  ]);

  return (
    <CheckoutTemplate
      addresses={addresses}
      b2bProfile={user ?? null}
      vatRate={FINANCIAL_CONSTANTS.VAT_RATE}
      depositRate={FINANCIAL_CONSTANTS.DEPOSIT_RATE}
    />
  );
}
