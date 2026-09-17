"use server";

import { revalidatePath } from "next/cache";
import { brandsApi } from "../api/brands.api";
import {
  createBrandSchema,
  updateBrandSchema,
  type CreateBrandInput,
  type UpdateBrandInput,
  type BrandTranslationInput,
  isValidIdentifier,
} from "@/validators";

function formatBrandTranslations(translations?: BrandTranslationInput[]) {
  if (!translations) return undefined;
  return translations
    .filter(
      (t) =>
        t.locale === "vi" ||
        (t.description !== null &&
          t.description !== undefined &&
          t.description.trim().length > 0),
    )
    .map((t) => ({
      locale: t.locale,
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

export const createBrandAction = async (formData: FormData) => {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as CreateBrandInput;
    const parsed = await createBrandSchema.safeParseAsync(data);

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
    const formattedTranslations = formatBrandTranslations(
      validatedData.translations,
    );

    const { data: createRes, error: createError } = await brandsApi.create({
      name: validatedData.name,
      slug: validatedData.slug,
      isActive: validatedData.isActive,
      translations: formattedTranslations ?? [],
    });

    if (createError || !createRes.data) {
      throw new Error(createError?.detail ?? "Failed to create brand");
    }

    revalidatePath("/brands");
    return { success: true, data: createRes.data };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[createBrandAction]", error);
    return {
      success: false,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "createBrandFailed",
      ),
    };
  }
};

export async function updateBrandAction(id: string, formData: FormData) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(id)) {
    return { success: false, error: t("brandNotFound") };
  }
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as UpdateBrandInput;
    const parsed = await updateBrandSchema.safeParseAsync(data);

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
    const formattedTranslations = formatBrandTranslations(
      validatedData.translations,
    );

    const { data: updateRes, error: updateError } = await brandsApi.update(id, {
      name: validatedData.name,
      slug: validatedData.slug,
      isActive: validatedData.isActive,
      translations: formattedTranslations,
    });

    if (updateError || !updateRes.data) {
      throw new Error(updateError?.detail ?? "Failed to update brand");
    }

    revalidatePath("/brands");
    return { success: true, data: updateRes.data };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[updateBrandAction]", error);
    return {
      success: false,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "updateBrandFailed",
      ),
    };
  }
}

export async function deleteBrandAction(id: string) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(id)) {
    return { success: false, error: t("brandNotFound") };
  }
  try {
    await requireAuth();

    const { error } = await brandsApi.delete(id);
    if (error) {
      throw new Error(error.detail);
    }

    revalidatePath("/brands");
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[deleteBrandAction]", error);
    return {
      success: false,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "deleteBrandFailed",
      ),
    };
  }
}
