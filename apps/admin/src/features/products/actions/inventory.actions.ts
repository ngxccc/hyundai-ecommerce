"use server";

import { warehouseStockService } from "@nhatnang/database/services";
import { updateWarehouseStockSchema } from "@nhatnang/database/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, AuthError } from "@/shared/lib/action-auth";
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

    const result = await warehouseStockService.setStock(validatedData);

    revalidatePath(`/products`);
    revalidatePath(`/products/${data.productId}/inventory`);

    return { success: true as const, data: result };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "UNAUTHORIZED" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
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
