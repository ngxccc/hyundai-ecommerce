"use server";

import { revalidatePath } from "next/cache";
import { productsApi } from "../api/products.api";
import type { AdminCreateProduct, AdminUpdateProduct } from "@/types/api";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductTranslationInput,
  isValidIdentifier,
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

function parseOptionalNumber(
  val: string | number | null | undefined,
): number | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "number") return isNaN(val) ? undefined : val;
  const cleaned = String(val).replace(/,/g, "").trim();
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  return isNaN(num) ? undefined : num;
}

function toTipTapJson(
  content: unknown,
): Record<string, unknown> | undefined {
  if (typeof content === "object") {
    return content as Record<string, unknown>;
  }
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed) return undefined;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Plain text, wrap into standard TipTap JSONContent structure
    }
    const paragraphs = trimmed.split("\n\n").filter(Boolean);
    if (paragraphs.length === 0) return undefined;
    return {
      type: "doc",
      content: paragraphs.map((p) => ({
        type: "paragraph",
        content: [{ type: "text", text: p.trim() }],
      })),
    };
  }
  return undefined;
}

function formatProductTranslations(
  translations?: ProductTranslationInput[],
): AdminCreateProduct["translations"] | undefined {
  if (!translations) return undefined;
  return translations
    .filter((t) => t.locale === "vi" || t.name.trim().length > 0)
    .map((t) => ({
      locale: t.locale,
      name: t.name.trim(),
      shortDescription: t.shortDescription?.trim()
        ? t.shortDescription.trim()
        : null,
      description: toTipTapJson(t.description) ?? null,
      seoTitle: t.seoTitle?.trim() ? t.seoTitle.trim() : null,
      seoDescription: t.seoDescription?.trim()
        ? t.seoDescription.trim()
        : null,
    }));
}

function toCreateProductDto(input: CreateProductInput): AdminCreateProduct {
  const rawPrice =
    typeof input.price === "string"
      ? Number(input.price.replace(/[.,]/g, "").trim())
      : Number(input.price);

  return {
    translations: formatProductTranslations(input.translations) ?? [],
    slug: input.slug.trim(),
    price: isNaN(rawPrice) ? 0 : rawPrice,
    images: input.images,
    brandId: input.brandId.trim() ? input.brandId.trim() : undefined,
    categoryId: input.categoryId.trim() ? input.categoryId.trim() : undefined,
    productType: input.productType,
    powerKva: parseOptionalNumber(input.powerKva),
    powerKw: parseOptionalNumber(input.powerKw),
    standbyPowerKva: parseOptionalNumber(input.standbyPowerKva),
    standbyPowerKw: parseOptionalNumber(input.standbyPowerKw),
    phase: input.phase ?? undefined,
    voltage: input.voltage?.trim() ? input.voltage.trim() : undefined,
    frequency: parseOptionalNumber(input.frequency) ?? 50,
    fuelType: input.fuelType ?? undefined,
    canopyType: input.canopyType ?? undefined,
    startMethod: input.startMethod ?? undefined,
    engineBrand: input.engineBrand?.trim()
      ? input.engineBrand.trim()
      : undefined,
    alternatorBrand: input.alternatorBrand?.trim()
      ? input.alternatorBrand.trim()
      : undefined,
    upsTopology: input.upsTopology ?? undefined,
    upsBatteryType: input.upsBatteryType ?? undefined,
    specSheet: input.specSheet as unknown as AdminCreateProduct["specSheet"],
    specs: input.specs ?? {},
    totalStockCache: input.totalStockCache,
    isQuoteOnly: input.isQuoteOnly,
    isActive: input.isActive,
  };
}

function toUpdateProductDto(input: UpdateProductInput): AdminUpdateProduct {
  const result: AdminUpdateProduct = {};

  if (input.translations !== undefined) {
    result.translations = formatProductTranslations(input.translations);
  }
  if (input.slug !== undefined) result.slug = input.slug.trim();
  if (input.price !== undefined) {
    const rawPrice =
      typeof input.price === "string"
        ? Number(input.price.replace(/[.,]/g, "").trim())
        : Number(input.price);
    result.price = isNaN(rawPrice) ? 0 : rawPrice;
  }
  if (input.images !== undefined) result.images = input.images;
  if (input.brandId !== undefined)
    result.brandId = input.brandId.trim() ? input.brandId.trim() : undefined;
  if (input.categoryId !== undefined)
    result.categoryId = input.categoryId.trim()
      ? input.categoryId.trim()
      : undefined;
  if (input.productType !== undefined) result.productType = input.productType;
  if (input.powerKva !== undefined)
    result.powerKva = parseOptionalNumber(input.powerKva);
  if (input.powerKw !== undefined)
    result.powerKw = parseOptionalNumber(input.powerKw);
  if (input.standbyPowerKva !== undefined)
    result.standbyPowerKva = parseOptionalNumber(input.standbyPowerKva);
  if (input.standbyPowerKw !== undefined)
    result.standbyPowerKw = parseOptionalNumber(input.standbyPowerKw);
  if (input.phase !== undefined) result.phase = input.phase ?? undefined;
  if (input.voltage !== undefined)
    result.voltage = input.voltage?.trim() ? input.voltage.trim() : undefined;
  if (input.frequency !== undefined)
    result.frequency = parseOptionalNumber(input.frequency) ?? 50;
  if (input.fuelType !== undefined)
    result.fuelType = input.fuelType ?? undefined;
  if (input.canopyType !== undefined)
    result.canopyType = input.canopyType ?? undefined;
  if (input.startMethod !== undefined)
    result.startMethod = input.startMethod ?? undefined;
  if (input.engineBrand !== undefined)
    result.engineBrand = input.engineBrand?.trim()
      ? input.engineBrand.trim()
      : undefined;
  if (input.alternatorBrand !== undefined)
    result.alternatorBrand = input.alternatorBrand?.trim()
      ? input.alternatorBrand.trim()
      : undefined;
  if (input.upsTopology !== undefined)
    result.upsTopology = input.upsTopology ?? undefined;
  if (input.upsBatteryType !== undefined)
    result.upsBatteryType = input.upsBatteryType ?? undefined;
  if (input.specSheet !== undefined)
    result.specSheet = (input.specSheet ??
      []) as unknown as AdminUpdateProduct["specSheet"];
  if (input.specs !== undefined) result.specs = input.specs ?? {};
  if (input.totalStockCache !== undefined)
    result.totalStockCache = input.totalStockCache;
  if (input.isQuoteOnly !== undefined) result.isQuoteOnly = input.isQuoteOnly;
  if (input.isActive !== undefined) result.isActive = input.isActive;

  return result;
}

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

    const { data: createRes, error: createError } = await productsApi.create(
      toCreateProductDto(validatedData),
    );
    if (createError || !createRes.data) {
      throw new Error(createError?.detail ?? "Failed to create product");
    }
    const newProduct = createRes.data;

    // Background Image Upload
    if (newProduct.id) {
      if (rawImages.length > 0) {
        after(async () => {
          try {
            const uploadedUrls: string[] = [];
            for (const item of rawImages) {
              const url = await uploadToCloudinary(item, "products");
              if (url) uploadedUrls.push(url);
            }
            if (uploadedUrls.length > 0) {
              await productsApi.update(newProduct.id, {
                images: [...validatedData.images, ...uploadedUrls],
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
  const t = await getTranslations("errors");
  if (!isValidIdentifier(id)) {
    return { success: false, error: t("productNotFound") };
  }
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

    const { data: getRes } = await productsApi.getById(id);
    const existingProduct = getRes?.data;
    const existingImages = existingProduct ? existingProduct.images : [];
    const imagesToDelete = existingImages.filter(
      (url) => !validatedData.images?.includes(url),
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

    const { data: updateRes, error: updateError } = await productsApi.update(
      id,
      toUpdateProductDto(validatedData),
    );
    if (updateError || !updateRes.data) {
      throw new Error(updateError?.detail ?? "Failed to update product");
    }
    const updatedProduct = updateRes.data;

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
            await productsApi.update(id, {
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
  const t = await getTranslations("errors");
  if (!isValidIdentifier(id)) {
    return { success: false, error: t("productNotFound") };
  }
  try {
    await requireAuth();
    const { error: deleteError } = await productsApi.delete(id);
    if (deleteError) {
      return {
        success: false as const,
        error: t("productNotFound"),
      };
    }
    const success = true;
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

    const { data: listRes } = await productsApi.list({
      search: cleanQuery,
      limit,
    });
    const data = listRes?.data ?? [];

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
