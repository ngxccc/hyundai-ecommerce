"use server";

import { revalidatePath } from "next/cache";
import { adminApiClient } from "@/lib/api-client";
import {
  createBrandSchema,
  updateBrandSchema,
  type CreateBrandInput,
  type UpdateBrandInput,
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

    const brandData = await adminApiClient.brands.create(validatedData);

    // Background Image Upload
    if (brandData?.id && logoFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(logoFile, "brands");
          if (url) {
            await adminApiClient.brands.update(brandData.id, { logo: url });
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

    const updatedBrand = await adminApiClient.brands.update(id, validatedData);

    // Background Tasks: Image Upload
    if (logoFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(logoFile, "brands");
          if (url) {
            await adminApiClient.brands.update(id, { logo: url });
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
  try {
    await requireAuth();
    const success = await adminApiClient.brands.delete(id);
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
