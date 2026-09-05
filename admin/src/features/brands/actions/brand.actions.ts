"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api-client";
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

    const { data: createRes, error: createError } = await api.POST("/brands", {
      body: validatedData as never,
    });
    if (createError || !createRes.data) {
      const errorMsg =
        createError && "detail" in createError ? createError.detail : undefined;
      throw new Error(errorMsg ?? "Failed to create brand");
    }
    const brandData = createRes.data;

    // Background Image Upload
    if (brandData.id && logoFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(logoFile, "brands");
          if (url) {
            await api.PUT("/brands/{id}", {
              params: { path: { id: brandData.id } },
              body: { logo: url },
            });
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
  if (!isValidIdentifier(id)) {
    return { success: false, error: "Invalid brand identifier" };
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

    const { data: updateRes, error: updateError } = await api.PUT(
      "/brands/{id}",
      {
        params: { path: { id } },
        body: validatedData as never,
      },
    );
    if (updateError || !updateRes.data) {
      const errorMsg =
        updateError && "detail" in updateError ? updateError.detail : undefined;
      throw new Error(errorMsg ?? "Failed to update brand");
    }
    const updatedBrand = updateRes.data;

    // Background Tasks: Image Upload
    if (logoFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(logoFile, "brands");
          if (url) {
            await api.PUT("/brands/{id}", {
              params: { path: { id } },
              body: { logo: url },
            });
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
  if (!isValidIdentifier(id)) {
    return { success: false, error: "Invalid brand identifier" };
  }
  try {
    await requireAuth();
    const { error: deleteError } = await api.DELETE("/brands/{id}", {
      params: { path: { id } },
    });
    if (deleteError) {
      const errorMsg = "detail" in deleteError ? deleteError.detail : undefined;
      throw new Error(errorMsg ?? "Failed to delete brand");
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
