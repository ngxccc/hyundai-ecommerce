"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api-client";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
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

    const { data: createRes, error: createError } = await api.POST(
      "/categories",
      {
        body: validatedData as never,
      },
    );
    if (createError || !createRes.data) {
      const errorMsg =
        createError && "detail" in createError ? createError.detail : undefined;
      throw new Error(errorMsg ?? "Failed to create category");
    }
    const categoryData = createRes.data;

    // Background Image Upload
    if (categoryData.id && imageFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(imageFile, "categories");
          if (url) {
            await api.PUT("/categories/{id}", {
              params: { path: { id: categoryData.id } },
              body: { image: url },
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
  if (!isValidIdentifier(id)) {
    return { success: false, error: "Invalid category identifier" };
  }
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

    const { data: updateRes, error: updateError } = await api.PUT(
      "/categories/{id}",
      {
        params: { path: { id } },
        body: validatedData as never,
      },
    );
    if (updateError || !updateRes.data) {
      const errorMsg =
        updateError && "detail" in updateError ? updateError.detail : undefined;
      throw new Error(errorMsg ?? "Failed to update category");
    }
    const updatedCategory = updateRes.data;

    // Background Image Upload
    if (imageFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(imageFile, "categories");
          if (url) {
            await api.PUT("/categories/{id}", {
              params: { path: { id } },
              body: { image: url },
            });
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
  if (!isValidIdentifier(id)) {
    return { success: false, error: "Invalid category identifier" };
  }
  try {
    await requireAuth();
    const { error: deleteError } = await api.DELETE("/categories/{id}", {
      params: { path: { id } },
    });
    if (deleteError) {
      const errorMsg = "detail" in deleteError ? deleteError.detail : undefined;
      throw new Error(errorMsg ?? "Failed to delete category");
    }
    const success = true;
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
