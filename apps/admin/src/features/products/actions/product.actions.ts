"use server";

import { revalidatePath } from "next/cache";
import { productService } from "@nhatnang/database/services";
import {
  createProductSchema,
  updateProductSchema,
  type TCreateProductInput,
  type TUpdateProductInput,
} from "@nhatnang/database/validators";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { z } from "zod";
import { requireAuth } from "@/shared/lib/action-auth";

export const createProductAction = async (data: TCreateProductInput) => {
  try {
    await requireAuth();
    const schema = createProductSchema((key) => key);
    const parsed = await schema.safeParseAsync(data);

    if (!parsed.success) {
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;

    const newProduct = await productService.create(validatedData);

    revalidatePath("/products");
    return { success: true, data: newProduct };
  } catch (error) {
    console.error("[createProductAction]", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to create product",
    };
  }
};

export async function updateProductAction(
  id: string,
  data: TUpdateProductInput,
) {
  try {
    await requireAuth();
    const schema = updateProductSchema((key) => key);
    const parsed = await schema.safeParseAsync(data);

    if (!parsed.success) {
      return {
        success: false,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;

    const updatedProduct = await productService.update(id, validatedData);

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error("[updateProductAction]", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAuth();
    const success = await productService.delete(id);

    revalidatePath("/products");
    return { success: true, data: success };
  } catch (error) {
    console.error("[deleteProductAction]", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}
