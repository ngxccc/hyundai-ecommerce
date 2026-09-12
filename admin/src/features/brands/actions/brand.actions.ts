"use server";

import { revalidatePath } from "next/cache";
import { brandsApi } from "../api/brands.api";
import {
  createBrandSchema,
  updateBrandSchema,
  type CreateBrandInput,
  type UpdateBrandInput,
  isValidIdentifier,
} from "@/shared/validators";
import { formatValidationErrors } from "@/shared/utils/validation";
import { SYSTEM_ERROR_CODES } from "@/shared/constants";
import {
  requireAuth,
  getAuthErrorMessage,
  getActionErrorMessage,
  AuthError,
} from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { after } from "next/server";
import { uploadToCloudinary, validateUploadedFile } from "@/shared/services";

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
    const logoFile = formData.get("logo") as File | null;
    if (logoFile) {
      const validation = validateUploadedFile(logoFile);
      if (!validation.valid && validation.error) {
        const t = await getTranslations("errors");
        return {
          success: false,
          error: t(validation.error as never),
        };
      }
    }

    const { data: createRes, error: createError } =
      await brandsApi.create({
        name: validatedData.name,
        slug: validatedData.slug,
        logo: validatedData.logo,
        isActive: validatedData.isActive,
        translations: [
          ...(validatedData.descriptionVi !== undefined
            ? [
                {
                  locale: "vi",
                  description: validatedData.descriptionVi,
                },
              ]
            : []),
          ...(validatedData.descriptionEn !== undefined
            ? [
                {
                  locale: "en",
                  description: validatedData.descriptionEn,
                },
              ]
            : []),
        ],
        descriptionVi: validatedData.descriptionVi,
        descriptionEn: validatedData.descriptionEn,
      });
    if (createError || !createRes.data) {
      throw new Error(createError?.detail ?? "Failed to create brand");
    }
    const brandData = createRes.data;

    // Background Image Upload
    if (brandData.id && logoFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(logoFile, "brands");
          if (url) {
            await brandsApi.update(brandData.id, { logo: url });
          }
        } catch (e) {
          console.error("[Background Brand Logo Upload Failed]", e);
        }
      });
    }

    revalidatePath("/brands");
    return { success: true as const, data: brandData };
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
    const logoFile = formData.get("logo") as File | null;
    if (logoFile) {
      const validation = validateUploadedFile(logoFile);
      if (!validation.valid && validation.error) {
        const t = await getTranslations("errors");
        return {
          success: false,
          error: t(validation.error as never),
        };
      }
    }

    const { data: updateRes, error: updateError } = await brandsApi.update(
      id,
      {
        name: validatedData.name,
        slug: validatedData.slug,
        logo: validatedData.logo,
        isActive: validatedData.isActive,
        ...(validatedData.descriptionVi !== undefined ||
        validatedData.descriptionEn !== undefined
          ? {
              translations: [
                ...(validatedData.descriptionVi !== undefined
                  ? [
                      {
                        locale: "vi",
                        description: validatedData.descriptionVi,
                      },
                    ]
                  : []),
                ...(validatedData.descriptionEn !== undefined
                  ? [
                      {
                        locale: "en",
                        description: validatedData.descriptionEn,
                      },
                    ]
                  : []),
              ],
            }
          : {}),
        descriptionVi: validatedData.descriptionVi,
        descriptionEn: validatedData.descriptionEn,
      },
    );
    if (updateError || !updateRes.data) {
      throw new Error(updateError?.detail ?? "Failed to update brand");
    }
    const updatedBrand = updateRes.data;

    // Background Tasks: Image Upload
    if (logoFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(logoFile, "brands");
          if (url) {
            await brandsApi.update(id, { logo: url });
          }
        } catch (e) {
          console.error("[Background Brand Update Upload Failed]", e);
        }
      });
    }

    revalidatePath("/brands");
    return { success: true as const, data: updatedBrand };
  } catch (error) {
    const t = await getTranslations("errors");
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
    const { error: deleteError } = await brandsApi.delete(id);
    if (deleteError) {
      throw new Error(deleteError.detail);
    }
    const success = true;
    revalidatePath("/brands");
    return { success: true as const, data: success };
  } catch (error) {
    const t = await getTranslations("errors");
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
