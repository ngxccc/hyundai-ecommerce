"use server";

import { revalidatePath } from "next/cache";
import { categoryService } from "@nhatnang/database/services";
import {
  getCreateCategorySchema,
  getUpdateCategorySchema,
  type TCreateCategoryInput,
  type TUpdateCategoryInput,
} from "@nhatnang/database/validators";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { z } from "zod";
import { requireAuth, AuthError } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";

export const createCategoryAction = async (data: TCreateCategoryInput) => {
  try {
    await requireAuth();
    const schema = getCreateCategorySchema((key) => key);
    const parsed = await schema.safeParseAsync(data);

    if (!parsed.success) {
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;

    const categoryData = await categoryService.create(validatedData);
    revalidatePath("/categories");
    return { success: true as const, data: categoryData };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[createCategoryAction]", error);
    let errorMessage = t("createCategoryFailed");
    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      errorMessage = t(key);
    }
    return {
      success: false as const,
      error: errorMessage,
    };
  }
};

export async function updateCategoryAction(
  id: string,
  data: TUpdateCategoryInput,
) {
  try {
    await requireAuth();
    const schema = getUpdateCategorySchema((key) => key);
    const parsed = await schema.safeParseAsync({ ...data, id });

    if (!parsed.success) {
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;

    const categoryData = await categoryService.update(validatedData);
    revalidatePath("/categories");
    revalidatePath(`/categories/${id}/edit`);
    return { success: true as const, data: categoryData };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[updateCategoryAction]", error);
    let errorMessage = t("updateCategoryFailed");
    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      errorMessage = t(key);
    }
    return {
      success: false as const,
      error: errorMessage,
    };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireAuth();
    const categoryData = await categoryService.delete(id);
    revalidatePath("/categories");
    return { success: true as const, data: categoryData };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[deleteCategoryAction]", error);
    let errorMessage = t("deleteCategoryFailed");
    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      errorMessage = t(key);
    }
    return {
      success: false as const,
      error: errorMessage,
    };
  }
}
