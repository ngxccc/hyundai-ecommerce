"use server";

import { revalidatePath } from "next/cache";
import { adminApiClient } from "@/lib/api-client";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
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
    const imageFile = formData.get("image") as File | null;
    if (imageFile) {
      const validation = validateUploadedFile(imageFile);
      if (!validation.valid && validation.error) {
        const t = await getTranslations("errors");
        return {
          success: false,
          error: t(validation.error as never),
        };
      }
    }

    const categoryData = await adminApiClient.categories.create(validatedData);

    // Background Image Upload
    if (categoryData.id && imageFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(imageFile, "categories");
          if (url) {
            await adminApiClient.categories.update(categoryData.id, {
              image: url,
            });
          }
        } catch (e) {
          console.error("[Background Category Image Upload Failed]", e);
        }
      });
    }

    revalidatePath("/categories");
    return { success: true, data: categoryData };
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
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as UpdateCategoryInput;
    const parsed = await updateCategorySchema.safeParseAsync(data);

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
    const imageFile = formData.get("image") as File | null;
    if (imageFile) {
      const validation = validateUploadedFile(imageFile);
      if (!validation.valid && validation.error) {
        const t = await getTranslations("errors");
        return {
          success: false,
          error: t(validation.error as never),
        };
      }
    }

    const updatedCategory = await adminApiClient.categories.update(
      id,
      validatedData,
    );

    // Background Image Upload
    if (imageFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(imageFile, "categories");
          if (url) {
            await adminApiClient.categories.update(id, { image: url });
          }
        } catch (e) {
          console.error("[Background Category Update Upload Failed]", e);
        }
      });
    }

    revalidatePath("/categories");
    return { success: true, data: updatedCategory };
  } catch (error) {
    const t = await getTranslations("errors");
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
  try {
    await requireAuth();
    const success = await adminApiClient.categories.delete(id);
    revalidatePath("/categories");
    return { success: true, data: success };
  } catch (error) {
    const t = await getTranslations("errors");
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
