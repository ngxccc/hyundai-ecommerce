"use server";

import { revalidatePath } from "next/cache";
import { orderService } from "@nhatnang/database/services";
import { orderStatusEnum, type TOrder } from "@nhatnang/database/schemas";
import { requireAuth, AuthError } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

const updateOrderStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(orderStatusEnum.enumValues),
});

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
