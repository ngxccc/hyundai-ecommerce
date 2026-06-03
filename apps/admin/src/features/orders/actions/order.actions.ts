"use server";

import { revalidatePath } from "next/cache";
import { orderService } from "@nhatnang/database/services";
import { type TOrder } from "@nhatnang/database/schemas";
import { requireAuth, AuthError } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import {
  getUpdateOrderStatusSchema,
  getSelectShippingBidSchema,
  getAddShippingBidSchema,
} from "@nhatnang/database/validators";
import type {
  TAddShippingBidInput,
  TOrderValidationMessageKey,
} from "@nhatnang/database/validators";

export const updateOrderStatusAction = async (
  orderId: string,
  status: TOrder["status"],
) => {
  const t = await getTranslations("errors");
  try {
    await requireAuth();

    // Validate inputs
    const parsed = getUpdateOrderStatusSchema().safeParse({ orderId, status });
    if (!parsed.success) {
      return {
        success: false as const,
        error: t("validationError"),
      };
    }

    const updated = await orderService.updateOrderStatus(orderId, status);
    if (!updated) {
      return {
        success: false as const,
        error: t("orderNotFound"),
      };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return {
      success: true as const,
      data: updated,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        error:
          error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[updateOrderStatusAction]", error);
    return {
      success: false as const,
      error: t("updateOrderStatusFailed") || "Failed to update order status",
    };
  }
};

export const selectShippingBidAction = async (
  orderId: string,
  bidId: string,
) => {
  const tErrors = await getTranslations("errors");
  const tAdminOrders = await getTranslations("AdminOrders");
  try {
    await requireAuth();

    // Validate inputs
    const parsed = getSelectShippingBidSchema().safeParse({ orderId, bidId });
    if (!parsed.success) {
      return {
        success: false as const,
        error: tErrors("validationError"),
      };
    }

    const result = await orderService.selectWinningBid(orderId, bidId);
    if (!result) {
      return {
        success: false as const,
        error: tErrors("orderNotFound"),
      };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return {
      success: true as const,
      data: {
        shippingFee: result.updatedOrder.shippingFee,
        selectedBid: result.selectedBid,
      },
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        error:
          error.message === "Unauthorized"
            ? tErrors("unauthorized")
            : tErrors("forbidden"),
      };
    }

    console.error("[selectShippingBidAction]", error);
    const message: string =
      error instanceof Error && error.message.startsWith("errors.")
        ? // @ts-expect-error - dynamic key
          tAdminOrders(error.message.replace("errors.", ""))
        : tAdminOrders("shippingBidsSelectWinnerError");
    return {
      success: false as const,
      error: message,
    };
  }
};

export const addShippingBidAction = async (data: TAddShippingBidInput) => {
  const tErrors = await getTranslations("errors");
  const tAdminOrders = await getTranslations("AdminOrders");
  const tValidator = (key: TOrderValidationMessageKey) => tAdminOrders(key);

  try {
    await requireAuth();

    // Validate inputs
    const parsed = getAddShippingBidSchema(tValidator).safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message;
      return {
        success: false as const,
        error: firstError ?? tErrors("validationError"),
      };
    }

    const newBid = await orderService.createShippingBid({
      orderId: parsed.data.orderId,
      vendorName: parsed.data.vendorName,
      quotedPrice: parsed.data.quotedPrice,
      internalNote: parsed.data.internalNote,
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${parsed.data.orderId}`);

    return {
      success: true as const,
      data: newBid,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        error:
          error.message === "Unauthorized"
            ? tErrors("unauthorized")
            : tErrors("forbidden"),
      };
    }

    console.error("[addShippingBidAction]", error);
    const message: string =
      error instanceof Error && error.message.startsWith("errors.")
        ? // @ts-expect-error - dynamic key
          tAdminOrders(error.message.replace("errors.", ""))
        : tErrors("createShippingBidFailed") || "Failed to add shipping bid";
    return {
      success: false as const,
      error: message,
    };
  }
};
