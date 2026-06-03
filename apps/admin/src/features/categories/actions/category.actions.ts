"use server";

import { revalidatePath } from "next/cache";
import { categoryService } from "@nhatnang/database/services";
import { mapCategoryToDTO } from "@nhatnang/database/dtos";
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
import { after } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/shared/services";

export const createCategoryAction = async (formData: FormData) => {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as TCreateCategoryInput;
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

    // Background Tasks: Image Upload
    const imageFile = formData.get("image") as File | null;
    if (imageFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(imageFile, "categories");
          if (url) {
            await categoryService.update({ id: categoryData.id, image: url });
          }
        } catch (e) {
          console.error("[Background Task Failed]", e);
        }
      });
    }

    revalidatePath("/categories");
    return { success: true as const, data: mapCategoryToDTO(categoryData) };
  } catch (error) {
    const t = await getTranslations("errors");

    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[createCategoryAction]", error);

    if (error instanceof Error) {
      if (error.message === "errors.validation.slugExists") {
        return {
          success: false as const,
          code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
          fieldErrors: { slug: [t("validation.slugExists")] },
        };
      }

      if (error.message.startsWith("errors.")) {
        const key = error.message.replace("errors.", "");
        // @ts-expect-error - dynamic key
        return { success: false as const, error: t(key) };
      }
    }

    return { success: false as const, error: t("createCategoryFailed") };
  }
};

export async function updateCategoryAction(
  id: string,
  formData: FormData,
) {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as TUpdateCategoryInput;

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

    const existingCategory = await categoryService.getById(id);
    const oldImage = existingCategory?.image;
    const newImageUrl = validatedData.image;

    const categoryData = await categoryService.update(validatedData);

    // Background Tasks: Image Upload & Cleanup
    const imageFile = formData.get("image") as File | null;
    if (imageFile || (oldImage && oldImage !== newImageUrl)) {
      after(async () => {
        try {
          // Cleanup removed image
          if (oldImage && oldImage !== newImageUrl) {
            await deleteFromCloudinary(oldImage);
          }

          if (imageFile) {
            const url = await uploadToCloudinary(imageFile, "categories");
            if (url) {
              await categoryService.update({ id: categoryData.id, image: url });
            }
          }
        } catch (e) {
          console.error("[Background Task Failed]", e);
        }
      });
    }

    revalidatePath("/categories");
    revalidatePath(`/categories/${id}/edit`);
    return { success: true as const, data: mapCategoryToDTO(categoryData) };
  } catch (error) {
    const t = await getTranslations("errors");

    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[updateCategoryAction]", error);

    if (error instanceof Error) {
      if (error.message === "errors.validation.slugExists") {
        return {
          success: false as const,
          code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
          fieldErrors: { slug: [t("validation.slugExists")] },
        };
      }

      if (error.message.startsWith("errors.")) {
        const key = error.message.replace("errors.", "");
        // @ts-expect-error - dynamic key
        return { success: false as const, error: t(key) };
      }
    }

    return { success: false as const, error: t("updateCategoryFailed") };
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
      return {
        success: false as const,
        error: error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[deleteCategoryAction]", error);

    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      return { success: false as const, error: t(key) };
    }

    return { success: false as const, error: t("deleteCategoryFailed") };
  }
}
