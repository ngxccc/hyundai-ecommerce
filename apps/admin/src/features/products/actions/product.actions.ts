"use server";

import { revalidatePath } from "next/cache";
import { productService } from "@nhatnang/database/services";
import {
  createProductSchema,
  updateProductSchema,
  type TCreateProductInput,
  type TUpdateProductInput,
} from "@nhatnang/database/validators";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { z } from "zod";
import { requireAuth, AuthError } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";

export const createProductAction = async (data: TCreateProductInput) => {
  try {
    await requireAuth();
    const schema = createProductSchema((key) => key);
    const parsed = await schema.safeParseAsync(data);

    if (!parsed.success) {
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;

    const newProduct = await productService.create(validatedData);

    revalidatePath("/products");
    return { success: true, data: newProduct };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[createProductAction]", error);
    return {
      success: false as const,
      error: t("createProductFailed"),
    };
  }
};

export async function updateProductAction(
  id: string,
  data: TUpdateProductInput,
) {
  try {
    await requireAuth();
    const schema = updateProductSchema((key) => key);
    const parsed = await schema.safeParseAsync(data);

    if (!parsed.success) {
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;

    const updatedProduct = await productService.update(id, validatedData);

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    return { success: true, data: updatedProduct };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[updateProductAction]", error);
    return {
      success: false as const,
      error: t("updateProductFailed"),
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAuth();
    const success = await productService.delete(id);
    
    const t = await getTranslations("errors");
    if (!success) {
      return {
        success: false as const,
        error: t("productNotFound"),
      };
    }

    revalidatePath("/products");
    return { success: true, data: success };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[deleteProductAction]", error);
    return {
      success: false as const,
      error: t("deleteProductFailed"),
    };
  }
}
