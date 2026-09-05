"use server";

import { api } from "@/lib/api-client";
import { updateWarehouseStockSchema } from "@/shared/validators";
import { revalidatePath } from "next/cache";
import { AuthError } from "@/shared/lib/action-auth";
import { requireAuth, getAuthErrorMessage } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

export async function setProductStockAction(data: {
  warehouseId: string;
  productId: string;
  stock: number;
  minStockWarning: number;
}) {
  try {
    await requireAuth();

    // Validate
    const parsed = await updateWarehouseStockSchema.safeParseAsync(data);

    if (!parsed.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;

    const { data: result } = await api.PUT("/warehouses/{id}/stock", {
      params: { path: { id: validatedData.warehouseId } },
      body: {
        productId: validatedData.productId,
        stock: validatedData.stock ?? 0,
        minStockWarning: validatedData.minStockWarning ?? 2,
      },
    });

    revalidatePath(`/products`);
    revalidatePath(`/products/${data.productId}/inventory`);

    return { success: true as const, data: result };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[setProductStockAction]", error);

    let errorMessage = t("updateWarehouseStockFailed");
    if (
      error instanceof Error &&
      error.message === "errors.updateWarehouseStockFailed"
    ) {
      errorMessage = t("updateWarehouseStockFailed"); // Ensure it exists in i18n
    }

    return {
      success: false as const,
      error: errorMessage,
    };
  }
}
