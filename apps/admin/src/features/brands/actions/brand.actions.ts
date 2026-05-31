"use server";

import { revalidatePath } from "next/cache";
import { brandService } from "@nhatnang/database/services";
import {
  getCreateBrandSchema,
  getUpdateBrandSchema,
  type TCreateBrandInput,
  type TUpdateBrandInput,
} from "@nhatnang/database/validators";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { z } from "zod";
import { requireAuth, AuthError } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";

export const createBrandAction = async (data: TCreateBrandInput) => {
  try {
    await requireAuth();
    const schema = getCreateBrandSchema((key) => key);
    const parsed = await schema.safeParseAsync(data);

    if (!parsed.success) {
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;

    const brandData = await brandService.create(validatedData);
    revalidatePath("/brands");
    return { success: true as const, data: brandData };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[createBrandAction]", error);
    let errorMessage = t("createBrandFailed");
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

export async function updateBrandAction(id: string, data: TUpdateBrandInput) {
  try {
    await requireAuth();
    const schema = getUpdateBrandSchema((key) => key);
    const parsed = await schema.safeParseAsync({ ...data, id });

    if (!parsed.success) {
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;

    const brandData = await brandService.update(validatedData);
    revalidatePath("/brands");
    revalidatePath(`/brands/${id}/edit`);
    return { success: true as const, data: brandData };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[updateBrandAction]", error);
    let errorMessage = t("updateBrandFailed");
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

export async function deleteBrandAction(id: string) {
  try {
    await requireAuth();
    const brandData = await brandService.delete(id);
    revalidatePath("/brands");
    return { success: true as const, data: brandData };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[deleteBrandAction]", error);
    let errorMessage = t("deleteBrandFailed");
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
