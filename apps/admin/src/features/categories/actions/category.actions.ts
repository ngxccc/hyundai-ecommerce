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
import { requireAuth } from "@/shared/lib/action-auth";

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

    const result = await categoryService.create(validatedData);
    if (result.success) {
      revalidatePath("/categories");
    }
    return result;
  } catch (error) {
    console.error("[createCategoryAction]", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to create category",
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

    const result = await categoryService.update(validatedData);
    if (result.success) {
      revalidatePath("/categories");
      revalidatePath(`/categories/${id}/edit`);
    }
    return result;
  } catch (error) {
    console.error("[updateCategoryAction]", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireAuth();
    const result = await categoryService.delete(id);
    if (result.success) {
      revalidatePath("/categories");
    }
    return result;
  } catch (error) {
    console.error("[deleteCategoryAction]", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}
