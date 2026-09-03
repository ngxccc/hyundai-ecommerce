"use server";

import { revalidatePath } from "next/cache";
import { warehouseService } from "@nhatnang/database/services";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  type TCreateWarehouse,
  type TUpdateWarehouse,
} from "@nhatnang/database/validators";
import { formatValidationErrors } from "@/shared/utils/validation";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { AuthError } from "@nhatnang/core";
import { requireAuth, getAuthErrorMessage } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";

export const createWarehouseAction = async (input: TCreateWarehouse) => {
  try {
    await requireAuth();
    const parsed = await createWarehouseSchema.safeParseAsync(input);
    if (!parsed.success) {
      const t = await getTranslations("errors");
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: formatValidationErrors(parsed.error, (key: string) =>
          t(key as never),
        ),
      };
    }

    const validatedData = parsed.data;

    const data = await warehouseService.create(validatedData);
    revalidatePath("/warehouses");
    return { success: true, data };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false, error: getAuthErrorMessage(error, t) };
    }
    console.error("[createWarehouseAction]", error);
    let errorMessage = t("createWarehouseFailed");
    if (
      error instanceof Error &&
      error.message === "errors.createWarehouseFailed"
    ) {
      errorMessage = t("createWarehouseFailed");
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
};

export async function updateWarehouseAction(
  id: string,
  input: TUpdateWarehouse,
) {
  try {
    await requireAuth();
    const parsed = await updateWarehouseSchema.safeParseAsync({ ...input, id });
    if (!parsed.success) {
      const t = await getTranslations("errors");
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: formatValidationErrors(parsed.error, (key: string) =>
          t(key as never),
        ),
      };
    }

    const validatedData = parsed.data;

    const data = await warehouseService.update(validatedData);
    revalidatePath("/warehouses");
    revalidatePath(`/warehouses/${id}/edit`);
    return { success: true, data };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false, error: getAuthErrorMessage(error, t) };
    }
    console.error("[updateWarehouseAction]", error);
    let errorMessage = t("updateWarehouseFailed");
    if (error instanceof Error) {
      if (error.message === "errors.warehouseNotFound") {
        errorMessage = t("warehouseNotFound");
      } else if (error.message === "errors.updateWarehouseFailed") {
        errorMessage = t("updateWarehouseFailed");
      }
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function deleteWarehouseAction(id: string) {
  try {
    await requireAuth();
    const data = await warehouseService.delete(id);
    revalidatePath("/warehouses");
    return { success: true, data };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false, error: getAuthErrorMessage(error, t) };
    }
    console.error("[deleteWarehouseAction]", error);
    let errorMessage = t("deleteWarehouseFailed");
    if (
      error instanceof Error &&
      error.message === "errors.deleteWarehouseFailed"
    ) {
      errorMessage = t("deleteWarehouseFailed");
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}
