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
import { requireAuth, AuthError } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { after } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/shared/services";

export const createProductAction = async (formData: FormData) => {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as TCreateProductInput;

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

    // Background Image Upload
    if (newProduct?.id) {
      const rawImages = formData.getAll("images") as (File | string)[];
      if (rawImages.length > 0) {
        after(async () => {
          try {
            const uploadedUrls: string[] = [];
            for (const item of rawImages) {
              const url = await uploadToCloudinary(item, "products");
              if (url) uploadedUrls.push(url);
            }
            if (uploadedUrls.length > 0) {
              await productService.update(newProduct.id, {
                images: [...(validatedData.images || []), ...uploadedUrls],
              });
            }
          } catch (e) {
            console.error("[Background Upload Failed]", e);
          }
        });
      }
    }

    revalidatePath("/products");
    return { success: true, data: newProduct };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[createProductAction]", error);
    return {
      success: false as const,
      error: t("createProductFailed"),
    };
  }
};

export async function updateProductAction(id: string, formData: FormData) {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as TUpdateProductInput;

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

    const existingProduct = await productService.getById(id);
    const existingImages = existingProduct?.images ?? [];
    const imagesToDelete = existingImages.filter(
      (url) => !(validatedData.images ?? []).includes(url),
    );

    const updatedProduct = await productService.update(id, validatedData);

    // Background Tasks: Image Upload & Cleanup
    const rawImages = formData.getAll("images") as (File | string)[];
    if (rawImages.length > 0 || imagesToDelete.length > 0) {
      after(async () => {
        try {
          // Cleanup removed images
          for (const url of imagesToDelete) {
            await deleteFromCloudinary(url);
          }

          // Upload new images
          const uploadedUrls: string[] = [];
          for (const item of rawImages) {
            const url = await uploadToCloudinary(item, "products");
            if (url) uploadedUrls.push(url);
          }
          if (uploadedUrls.length > 0) {
            await productService.update(id, {
              images: [...(validatedData.images ?? []), ...uploadedUrls],
            });
          }
        } catch (e) {
          console.error("[Background Task Failed]", e);
        }
      });
    }

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    return { success: true, data: updatedProduct };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[updateProductAction]", error);
    return {
      success: false as const,
      error: t("updateProductFailed"),
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAuth();
    const success = await productService.delete(id);

    const t = await getTranslations("errors");
    if (!success) {
      return {
        success: false as const,
        error: t("productNotFound"),
      };
    }

    revalidatePath("/products");
    return { success: true, data: success };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      const message =
        error.message === "Unauthorized" ? t("unauthorized") : t("forbidden");
      return { success: false as const, error: message };
    }
    console.error("[deleteProductAction]", error);
    return {
      success: false as const,
      error: t("deleteProductFailed"),
    };
  }
}
