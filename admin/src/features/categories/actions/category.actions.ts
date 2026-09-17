"use server";

import { revalidatePath } from "next/cache";
import { categoriesApi } from "../api/categories.api";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryTranslationInput,
  isValidIdentifier,
} from "@/validators";

function formatCategoryTranslations(translations?: CategoryTranslationInput[]) {
  if (!translations) return undefined;
  return translations
    .filter((t) => t.locale === "vi" || t.name.trim().length > 0)
    .map((t) => ({
      locale: t.locale,
      name: t.name.trim(),
      description: t.description?.trim() ?? null,
    }));
}

import { formatValidationErrors } from "@/lib/validation";
import { SYSTEM_ERROR_CODES } from "@/constants";
import {
  requireAuth,
  getAuthErrorMessage,
  getActionErrorMessage,
  AuthError,
} from "@/lib/action-auth";
import { getTranslations } from "next-intl/server";

export const createCategoryAction = async (formData: FormData) => {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as CreateCategoryInput;
    const parsed = await createCategorySchema.safeParseAsync(data);

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
    const formattedTranslations = formatCategoryTranslations(
      validatedData.translations,
    );

    const { data: createRes, error: createError } = await categoriesApi.create({
      slug: validatedData.slug,
      parentId: validatedData.parentId,
      isActive: validatedData.isActive,
      translations: formattedTranslations ?? [],
    });

    if (createError || !createRes.data) {
      throw new Error(createError?.detail ?? "Failed to create category");
    }

    revalidatePath("/categories");
    return { success: true, data: createRes.data };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[createCategoryAction]", error);
    return {
      success: false,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "createCategoryFailed",
      ),
    };
  }
};

export async function updateCategoryAction(id: string, formData: FormData) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(id)) {
    return { success: false, error: t("categoryNotFound") };
  }
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as UpdateCategoryInput;
    const parsed = await updateCategorySchema.safeParseAsync(data);

    if (!parsed.success) {
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: formatValidationErrors(parsed.error, (key: string) =>
          t(key as never),
        ),
      };
    }

    const validatedData = parsed.data;
    const formattedTranslations = formatCategoryTranslations(
      validatedData.translations,
    );

    const { data: updateRes, error: updateError } = await categoriesApi.update(
      id,
      {
        slug: validatedData.slug,
        parentId: validatedData.parentId,
        isActive: validatedData.isActive,
        translations: formattedTranslations,
      },
    );

    if (updateError || !updateRes.data) {
      throw new Error(updateError?.detail ?? "Failed to update category");
    }

    revalidatePath("/categories");
    return { success: true, data: updateRes.data };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[updateCategoryAction]", error);
    return {
      success: false,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "updateCategoryFailed",
      ),
    };
  }
}

export async function deleteCategoryAction(id: string) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(id)) {
    return { success: false, error: t("categoryNotFound") };
  }
  try {
    await requireAuth();

    const { error } = await categoriesApi.delete(id);
    if (error) {
      throw new Error(error.detail);
    }

    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[deleteCategoryAction]", error);
    return {
      success: false,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "deleteCategoryFailed",
      ),
    };
  }
}
