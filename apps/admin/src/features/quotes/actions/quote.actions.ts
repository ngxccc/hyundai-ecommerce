"use server";

import { revalidatePath } from "next/cache";
import { quotesService } from "@nhatnang/database/services";
import { type Quote } from "@nhatnang/database/schemas";
import { AuthError } from "@nhatnang/core";
import {
  requireAuth,
  getAuthErrorMessage,
  getActionErrorMessage,
} from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import {
  quoteIdSchema,
  updateQuoteItemPriceSchema,
  sendQuoteMessageSchema,
  updateQuoteStatusSchema,
  createAdminQuoteSchema,
} from "@nhatnang/database/validators";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { formatValidationErrors } from "@/shared/utils/validation";
export const approveAndConvertToOrderAction = async (quoteId: string) => {
  const t = await getTranslations("errors");
  try {
    const session = await requireAuth();
    const adminUserId = session.user.id;

    const parsed = quoteIdSchema.safeParse({ quoteId });
    if (!parsed.success) {
      return {
        success: false as const,
        error: t("validationError"),
      };
    }

    const result = await quotesService.approveAndConvertToOrder(
      quoteId,
      adminUserId,
    );

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}`);
    revalidatePath("/orders");

    return {
      success: true as const,
      data: result,
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: getAuthErrorMessage(error, t),
      };
    }

    console.error("[approveAndConvertToOrderAction]", error);

    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.startsWith("errors.")) {
      const key = errorMessage.replace("errors.", "");
      // Safe fallback translations mapping
      return {
        success: false as const,
        error: t(key as never) || t("default"),
      };
    }

    return {
      success: false as const,
      error: t("createOrderFailed") || "Failed to create order",
    };
  }
};

export const updateQuoteItemPriceAction = async (
  quoteId: string,
  itemId: string,
  agreedPrice: string,
) => {
  const t = await getTranslations("errors");
  try {
    const session = await requireAuth();
    const adminUserId = session.user.id;

    const parsed = updateQuoteItemPriceSchema.safeParse({
      quoteId,
      itemId,
      agreedPrice,
    });
    if (!parsed.success) {
      return {
        success: false as const,
        error: t("validationError"),
      };
    }

    const quote = await quotesService.getComplexQuote(quoteId);
    if (!quote) {
      return {
        success: false as const,
        error: t("quoteNotFound"),
      };
    }

    if (
      quote.status === "approved" ||
      quote.status === "rejected" ||
      quote.status === "expired"
    ) {
      return {
        success: false as const,
        error: t("quoteNotEditableOrConvertible"),
      };
    }

    const item = quote.items.find((i) => i.id === itemId);
    if (!item) {
      return {
        success: false as const,
        error: "Item not found",
      };
    }

    const updated = await quotesService.updateQuoteItemPrice(
      itemId,
      agreedPrice,
    );
    if (!updated) {
      return {
        success: false as const,
        error: "Failed to update item price",
      };
    }

    const formattedPrice =
      parseFloat(agreedPrice).toLocaleString("vi-VN") + " VND";
    const itemName =
      item.itemName ?? item.product?.nameVi ?? "hạng mục báo giá";
    await quotesService.addQuoteMessage({
      quoteId,
      senderId: adminUserId,
      message: `[SYSTEM] Đã cập nhật giá thương lượng cho sản phẩm "${itemName}" thành ${formattedPrice}`,
    });

    if (quote.status === "pending_review") {
      await quotesService.updateQuoteStatus(quoteId, "negotiating");
      await quotesService.addQuoteMessage({
        quoteId,
        senderId: adminUserId,
        message: `[SYSTEM] Trạng thái báo giá chuyển sang: Đang thương lượng (negotiating)`,
      });
    }

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}`);

    return {
      success: true as const,
      data: updated,
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: getAuthErrorMessage(error, t),
      };
    }

    console.error("[updateQuoteItemPriceAction]", error);
    return {
      success: false as const,
      error: t("default"),
    };
  }
};

export const sendQuoteMessageAction = async (
  quoteId: string,
  message: string,
) => {
  const t = await getTranslations("errors");
  try {
    const session = await requireAuth();
    const adminUserId = session.user.id;

    const parsed = sendQuoteMessageSchema.safeParse({ quoteId, message });
    if (!parsed.success) {
      return {
        success: false as const,
        error: t("validationError"),
      };
    }

    const newMessage = await quotesService.sendAdminNegotiationMessage({
      quoteId,
      adminUserId,
      message,
    });

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}`);

    return {
      success: true as const,
      data: newMessage,
    };
  } catch (error: unknown) {
    console.error("[sendQuoteMessageAction]", error);
    return {
      success: false as const,
      error: getActionErrorMessage(error, (key) => t(key as never), "default"),
    };
  }
};

export const updateQuoteStatusAction = async (
  quoteId: string,
  status: Quote["status"],
) => {
  const t = await getTranslations("errors");
  try {
    const session = await requireAuth();
    const adminUserId = session.user.id;

    const parsed = updateQuoteStatusSchema.safeParse({ quoteId, status });
    if (!parsed.success) {
      return {
        success: false as const,
        error: t("validationError"),
      };
    }

    if (status === "approved") {
      return {
        success: false as const,
        error: "Please use the approve action to convert quote to order",
      };
    }

    const quote = await quotesService.getComplexQuote(quoteId);
    if (!quote) {
      return {
        success: false as const,
        error: t("quoteNotFound"),
      };
    }

    if (
      quote.status === "approved" ||
      quote.status === "rejected" ||
      quote.status === "expired"
    ) {
      return {
        success: false as const,
        error: t("quoteNotEditableOrConvertible"),
      };
    }

    const updated = await quotesService.updateQuoteStatus(quoteId, status);
    if (!updated) {
      return {
        success: false as const,
        error: "Failed to update quote status",
      };
    }

    let statusTextVi = "";
    if (status === "negotiating") {
      statusTextVi = "Đang thương lượng (negotiating)";
    } else if (status === "rejected") {
      statusTextVi = "Đã bị từ chối (rejected)";
    } else if (status === "expired") {
      statusTextVi = "Đã hết hạn (expired)";
    } else {
      statusTextVi = status;
    }

    await quotesService.addQuoteMessage({
      quoteId,
      senderId: adminUserId,
      message: `[SYSTEM] Trạng thái báo giá chuyển sang: ${statusTextVi}`,
    });

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}`);

    return {
      success: true as const,
      data: updated,
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: getAuthErrorMessage(error, t),
      };
    }

    console.error("[updateQuoteStatusAction]", error);
    return {
      success: false as const,
      error: t("default"),
    };
  }
};

/**
 * Server Action to create a new formal admin quote with line items and snapshot fields.
 */
export const createAdminQuoteAction = async (payload: unknown) => {
  const t = await getTranslations("errors");
  try {
    const session = await requireAuth();

    const parsed = await createAdminQuoteSchema.safeParseAsync(payload);
    if (!parsed.success) {
      return {
        success: false as const,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        error: t("validationError"),
        fieldErrors: formatValidationErrors(parsed.error, (key: string) =>
          t(key as never),
        ),
      };
    }

    const createdQuote = await quotesService.createAdminQuote({
      ...parsed.data,
      createdByAdminId: session.user.id,
    });

    revalidatePath("/quotes");

    return {
      success: true as const,
      data: createdQuote,
    };
  } catch (error: unknown) {
    console.error("[createAdminQuoteAction]", error);
    return {
      success: false as const,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "createQuoteFailed",
      ),
    };
  }
};
