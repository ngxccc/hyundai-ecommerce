"use server";

import { revalidatePath } from "next/cache";
import { orderService } from "@nhatnang/database/services";
import { type TOrder } from "@nhatnang/database/schemas";
import { requireAuth, AuthError, assertRole } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import {
  updateOrderStatusSchema,
  selectShippingBidSchema,
  addShippingBidSchema,
} from "@nhatnang/database/validators";
import type { TAddShippingBidInput } from "@nhatnang/database/validators";

export const updateOrderStatusAction = async (
  orderId: string,
  status: TOrder["status"],
) => {
  const t = await getTranslations("errors");
  try {
    await requireAuth();

    // Validate inputs
    const parsed = updateOrderStatusSchema.safeParse({ orderId, status });
    if (!parsed.success) {
      return {
        success: false,
        error: t("validationError"),
      };
    }

    const updated = await orderService.updateOrderStatus(orderId, status);
    if (!updated) {
      return {
        success: false,
        error: t("orderNotFound"),
      };
    }

    revalidatePath("/[locale]/orders", "page");
    revalidatePath("/[locale]/orders/[id]", "page");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error:
          error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[updateOrderStatusAction]", error);
    return {
      success: false,
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
    const parsed = selectShippingBidSchema.safeParse({ orderId, bidId });
    if (!parsed.success) {
      return {
        success: false,
        error: tErrors("validationError"),
      };
    }

    const result = await orderService.selectWinningBid(orderId, bidId);
    if (!result) {
      return {
        success: false,
        error: tErrors("orderNotFound"),
      };
    }

    revalidatePath("/[locale]/orders", "page");
    revalidatePath("/[locale]/orders/[id]", "page");

    return {
      success: true,
      data: {
        shippingFee: result.updatedOrder.shippingFee,
        selectedBid: result.selectedBid,
      },
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
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
      success: false,
      error: message,
    };
  }
};

export const addShippingBidAction = async (data: TAddShippingBidInput) => {
  const tErrors = await getTranslations("errors");
  const tAdminOrders = await getTranslations("AdminOrders");

  try {
    await requireAuth();

    // Validate inputs
    const parsed = addShippingBidSchema.safeParse(data);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue?.path[0] as string;
      let message = tErrors("validationError");
      if (firstIssue) {
        if (field === "vendorName") {
          message = tAdminOrders("shippingBidsVendorNameRequired");
        } else if (field === "quotedPrice") {
          message = tAdminOrders("shippingBidsQuotedPriceRequired");
        }
      }
      return {
        success: false,
        error: message,
      };
    }

    const newBid = await orderService.createShippingBid({
      orderId: parsed.data.orderId,
      vendorName: parsed.data.vendorName,
      quotedPrice: parsed.data.quotedPrice,
      internalNote: parsed.data.internalNote,
    });

    revalidatePath("/[locale]/orders", "page");
    revalidatePath("/[locale]/orders/[id]", "page");

    return {
      success: true,
      data: newBid,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
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
      success: false,
      error: message,
    };
  }
};

export const approveDealerOrderAction = async (orderId: string) => {
  const t = await getTranslations("errors");
  try {
    await assertRole(["SUPER_ADMIN", "SALES_REPRESENTATIVE", "ACCOUNTANT"]);

    const updated = await orderService.approveDealerOrder(orderId);
    if (!updated) {
      return {
        success: false,
        error: t("orderNotFound") || "Order not found",
      };
    }

    revalidatePath("/[locale]/orders", "page");
    revalidatePath("/[locale]/orders/[id]", "page");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error:
          error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[approveDealerOrderAction]", error);
    return {
      success: false,
      error: t("approveDealerOrderFailed") || "Failed to approve dealer order",
    };
  }
};

export const verifyManualBankTransferAction = async (orderId: string) => {
  const t = await getTranslations("errors");
  try {
    const session = await assertRole(["SUPER_ADMIN", "ACCOUNTANT"]);

    const updated = await orderService.verifyManualBankTransfer(
      orderId,
      session.user.id,
    );
    if (!updated) {
      return {
        success: false,
        error: t("orderNotFound") || "Order not found",
      };
    }

    revalidatePath("/[locale]/orders", "page");
    revalidatePath("/[locale]/orders/[id]", "page");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error:
          error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[verifyManualBankTransferAction]", error);
    return {
      success: false,
      error:
        t("verifyManualBankTransferFailed") ||
        "Failed to verify manual bank transfer",
    };
  }
};

export const approveOrderCancellationAction = async (orderId: string) => {
  const t = await getTranslations("errors");
  try {
    await assertRole(["SUPER_ADMIN", "SALES_REPRESENTATIVE", "ACCOUNTANT"]);

    const updated = await orderService.approveOrderCancellation(orderId);
    if (!updated) {
      return {
        success: false,
        error: t("orderNotFound") || "Order not found",
      };
    }

    revalidatePath("/[locale]/orders", "page");
    revalidatePath("/[locale]/orders/[id]", "page");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error:
          error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[approveOrderCancellationAction]", error);
    return {
      success: false,
      error:
        t("approveOrderCancellationFailed") ||
        "Failed to approve order cancellation",
    };
  }
};
