"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { auth } from "@nhatnang/database/auth";
import { cartService } from "@nhatnang/database/services";
import type { CartItem } from "./hooks/use-cart";
import { getTranslationError } from "@/shared/lib/utils";

export const getDbCartAction = async () => {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user) {
      return { success: true, items: [] as CartItem[] };
    }

    const cart = await cartService.getOrCreateCart(session.user.id);
    const dbItems = await cartService.getCartItems(cart.id);

    const locale = await getLocale();

    const mappedItems: CartItem[] = dbItems
      .filter(
        (
          item,
        ): item is typeof item & {
          product: NonNullable<typeof item.product>;
        } => item.product !== null,
      )
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        name:
          locale === "en" && item.product.nameEn
            ? item.product.nameEn
            : item.product.nameVi,
        price: item.product.price,
        image: item.product.images?.[0] ?? "",
        totalStock: item.product.totalStockCache,
      }));

    return { success: true, items: mappedItems };
  } catch (error) {
    console.error("[getDbCartAction]", error);
    const errorMessage = await getTranslationError(error);
    return { success: false, error: errorMessage };
  }
};

export const addToDbCartAction = async (
  productId: string,
  quantity: number,
) => {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user) {
      const errorMessage = await getTranslationError("unauthorized");
      return { success: false, error: errorMessage };
    }

    const cart = await cartService.getOrCreateCart(session.user.id);
    await cartService.addToCart(cart.id, productId, quantity);

    return { success: true };
  } catch (error) {
    console.error("[addToDbCartAction]", error);
    const errorMessage = await getTranslationError(error, "addToCartFailed");
    return { success: false, error: errorMessage };
  }
};

export const updateDbQuantityAction = async (
  productId: string,
  quantity: number,
) => {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user) {
      const errorMessage = await getTranslationError("unauthorized");
      return { success: false, error: errorMessage };
    }

    const cart = await cartService.getOrCreateCart(session.user.id);
    await cartService.updateCartItemQuantity(cart.id, productId, quantity);

    return { success: true };
  } catch (error) {
    console.error("[updateDbQuantityAction]", error);
    const errorMessage = await getTranslationError(error, "updateCartFailed");
    return { success: false, error: errorMessage };
  }
};

export const removeFromDbCartAction = async (productId: string) => {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user) {
      const errorMessage = await getTranslationError("unauthorized");
      return { success: false, error: errorMessage };
    }

    const cart = await cartService.getOrCreateCart(session.user.id);
    await cartService.removeFromCart(cart.id, productId);

    return { success: true };
  } catch (error) {
    console.error("[removeFromDbCartAction]", error);
    const errorMessage = await getTranslationError(
      error,
      "removeFromCartFailed",
    );
    return { success: false, error: errorMessage };
  }
};

export const mergeLocalCartAction = async (
  localItems: { productId: string; quantity: number }[],
) => {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user) {
      const errorMessage = await getTranslationError("unauthorized");
      return { success: false, error: errorMessage };
    }

    await cartService.mergeLocalItems(session.user.id, localItems);

    return { success: true };
  } catch (error) {
    console.error("[mergeLocalCartAction]", error);
    const errorMessage = await getTranslationError(error, "mergeCartFailed");
    return { success: false, error: errorMessage };
  }
};
