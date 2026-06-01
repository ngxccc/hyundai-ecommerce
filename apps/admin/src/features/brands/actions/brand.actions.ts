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
import { requireAuth, AuthError } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import { after } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/shared/services";

export const createBrandAction = async (formData: FormData) => {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as TCreateBrandInput;
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

    const brandData = await brandService.create(validatedData);

    // Background Tasks: Image Upload
    const logoFile = formData.get("logo") as File | null;
    if (logoFile) {
      after(async () => {
        try {
          const url = await uploadToCloudinary(logoFile, "brands");
          if (url) {
            await brandService.update({ id: brandData.id, logo: url });
          }
        } catch (e) {
          console.error("[Background Task Failed]", e);
        }
      });
    }

    revalidatePath("/brands");
    return { success: true as const, data: brandData };
  } catch (error) {
    const t = await getTranslations("errors");

    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[createBrandAction]", error);

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

    return { success: false as const, error: t("createBrandFailed") };
  }
};

export async function updateBrandAction(id: string, formData: FormData) {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as TUpdateBrandInput;

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

    const existingBrand = await brandService.getById(id);
    const oldLogo = existingBrand?.logo;
    const newLogoUrl = validatedData.logo;

    const brandData = await brandService.update(validatedData);

    // Background Tasks: Image Upload & Cleanup
    const logoFile = formData.get("logo") as File | null;
    if (logoFile || (oldLogo && oldLogo !== newLogoUrl)) {
      after(async () => {
        try {
          // Cleanup removed image if it was replaced by a new file or explicitly removed
          if (oldLogo && oldLogo !== newLogoUrl) {
            await deleteFromCloudinary(oldLogo);
          }

          if (logoFile) {
            const url = await uploadToCloudinary(logoFile, "brands");
            if (url) {
              await brandService.update({ id: brandData.id, logo: url });
            }
          }
        } catch (e) {
          console.error("[Background Task Failed]", e);
        }
      });
    }

    revalidatePath("/brands");
    revalidatePath(`/brands/${id}/edit`);
    return { success: true as const, data: brandData };
  } catch (error) {
    const t = await getTranslations("errors");

    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[updateBrandAction]", error);

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

    return { success: false as const, error: t("updateBrandFailed") };
  }
}

export async function deleteBrandAction(id: string) {
  try {
    await requireAuth();
    const brandData = await brandService.delete(id);
    revalidatePath("/brands");
    return { success: true as const, data: brandData };
  } catch (error) {
    const t = await getTranslations("errors");

    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[deleteBrandAction]", error);

    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      return { success: false as const, error: t(key) };
    }

    return { success: false as const, error: t("deleteBrandFailed") };
  }
}
