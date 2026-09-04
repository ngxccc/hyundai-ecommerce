"use server";

import { revalidatePath } from "next/cache";
import { adminApiClient } from "@/lib/api-client";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/shared/validators";
import { formatValidationErrors } from "@/shared/utils/validation";
import { SYSTEM_ERROR_CODES } from "@/shared/constants";
import { AuthError } from "@/shared/lib/action-auth";
import {
  requireAuth,
  getAuthErrorMessage,
  getActionErrorMessage,
} from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { after } from "next/server";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  validateUploadedFile,
} from "@/shared/services";

export const createProductAction = async (formData: FormData) => {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as CreateProductInput;

    const parsed = await createProductSchema.safeParseAsync(data);
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
    const rawImages = formData.getAll("images") as (File | string)[];
    for (const item of rawImages) {
      const validation = validateUploadedFile(item);
      if (!validation.valid && validation.error) {
        const t = await getTranslations("errors");
        return {
          success: false as const,
          error: t(validation.error as never),
        };
      }
    }

    const newProduct = await adminApiClient.products.create(validatedData);

    // Background Image Upload
    if (newProduct?.id) {
      if (rawImages.length > 0) {
        after(async () => {
          try {
            const uploadedUrls: string[] = [];
            for (const item of rawImages) {
              const url = await uploadToCloudinary(item, "products");
              if (url) uploadedUrls.push(url);
            }
            if (uploadedUrls.length > 0) {
              await adminApiClient.products.update(newProduct.id, {
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
    return {
      success: true,
      data: newProduct,
    };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[createProductAction]", error);
    return {
      success: false as const,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "createProductFailed",
      ),
    };
  }
};

export async function updateProductAction(id: string, formData: FormData) {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as UpdateProductInput;

    const parsed = await updateProductSchema.safeParseAsync(data);
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

    const existingProduct = await adminApiClient.products.getById(id);
    const existingImages = existingProduct?.images ?? [];
    const imagesToDelete = existingImages.filter(
      (url) => !(validatedData.images ?? []).includes(url),
    );

    const rawImages = formData.getAll("images") as (File | string)[];
    for (const item of rawImages) {
      const validation = validateUploadedFile(item);
      if (!validation.valid && validation.error) {
        const t = await getTranslations("errors");
        return {
          success: false as const,
          error: t(validation.error as never),
        };
      }
    }

    const updatedProduct = await adminApiClient.products.update(
      id,
      validatedData,
    );

    // Background Tasks: Image Upload & Cleanup
    if (rawImages.length > 0 || imagesToDelete.length > 0) {
      after(async () => {
        try {
          // Cleanup removed images
          for (const url of imagesToDelete) {
            await deleteFromCloudinary(url, "products");
          }
          // Upload new images
          const uploadedUrls: string[] = [];
          for (const item of rawImages) {
            const url = await uploadToCloudinary(item, "products");
            if (url) uploadedUrls.push(url);
          }
          if (uploadedUrls.length > 0) {
            await adminApiClient.products.update(id, {
              images: [...(validatedData.images || []), ...uploadedUrls],
            });
          }
        } catch (e) {
          console.error("[Background Task Failed]", e);
        }
      });
    }

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    return {
      success: true,
      data: updatedProduct,
    };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[updateProductAction]", error);
    return {
      success: false as const,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "updateProductFailed",
      ),
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAuth();
    const success = await adminApiClient.products.delete(id);

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
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[deleteProductAction]", error);
    return {
      success: false as const,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "deleteProductFailed",
      ),
    };
  }
}

/**
 * Server action for searching products with debounced querying.
 * Used by the ProductSearchModal and Quote Composer to locate generator models.
 *
 * @param query - Keyword matching nameVi, nameEn, model, or slug
 * @param limit - Max number of items to return (default: 10)
 */
export async function searchProductsAction(query: string, limit = 10) {
  try {
    await requireAuth();

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return { success: true as const, data: [] };
    }

    const res = await adminApiClient.products.list({
      search: cleanQuery,
      limit,
    });
    const data = "items" in res ? res.items : Array.isArray(res) ? res : [];

    return { success: true as const, data };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[searchProductsAction]", error);
    return {
      success: false as const,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "searchProductsFailed",
      ),
    };
  }
}
