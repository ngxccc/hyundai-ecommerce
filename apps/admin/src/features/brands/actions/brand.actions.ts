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

export const createBrandAction = async (data: TCreateBrandInput) => {
  try {
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

    const result = await brandService.create(validatedData);
    if (result.success) {
      revalidatePath("/brands");
    }
    return result;
  } catch (error) {
    console.error("[createBrandAction]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create brand",
    };
  }
};

export async function updateBrandAction(id: string, data: TUpdateBrandInput) {
  try {
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

    const result = await brandService.update(validatedData);
    if (result.success) {
      revalidatePath("/brands");
      revalidatePath(`/brands/${id}/edit`);
    }
    return result;
  } catch (error) {
    console.error("[updateBrandAction]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update brand",
    };
  }
}

export async function deleteBrandAction(id: string) {
  try {
    const result = await brandService.delete(id);
    if (result.success) {
      revalidatePath("/brands");
    }
    return result;
  } catch (error) {
    console.error("[deleteBrandAction]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete brand",
    };
  }
}
