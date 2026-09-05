"use server";

import { revalidatePath } from "next/cache";
import { adminApiClient, ApiClientError } from "@/lib/api-client";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  type CreateWarehouseInput,
  type UpdateWarehouseInput,
  isValidIdentifier,
} from "@/shared/validators";
import { formatValidationErrors } from "@/shared/utils/validation";
import { SYSTEM_ERROR_CODES } from "@/shared/constants";
import {
  requireAuth,
  getAuthErrorMessage,
  AuthError,
} from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";

export const createWarehouseAction = async (input: CreateWarehouseInput) => {
  const t = await getTranslations("errors");
  try {
    await requireAuth();
    const parsed = await createWarehouseSchema.safeParseAsync(input);

    if (!parsed.success) {
      return {
        success: false as const,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: formatValidationErrors(parsed.error, (k) => t(k as never)),
      };
    }

    const validatedData = parsed.data;
    const nameVi = validatedData.nameVi ?? validatedData.name ?? "";

    const payload = {
      nameVi,
      nameEn: validatedData.nameEn ?? null,
      streetAddress: validatedData.streetAddress,
      district: validatedData.district,
      city: validatedData.city,
      isActive: validatedData.isActive,
    };

    const data = await adminApiClient.warehouses.create(payload);

    revalidatePath("/warehouses");
    return { success: true as const, data };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[createWarehouseAction]", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("createWarehouseFailed"),
    };
  }
};

export async function updateWarehouseAction(
  id: string,
  input: UpdateWarehouseInput,
) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(id)) {
    return { success: false as const, error: t("default") };
  }
  try {
    await requireAuth();
    const parsed = await updateWarehouseSchema.safeParseAsync(input);

    if (!parsed.success) {
      return {
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: formatValidationErrors(parsed.error, (k) => t(k as never)),
      };
    }

    const validatedData = parsed.data;
    const updatePayload: Record<string, unknown> = {};

    const nameVi = validatedData.nameVi ?? validatedData.name;
    if (nameVi !== undefined) updatePayload.nameVi = nameVi;
    if (validatedData.nameEn !== undefined)
      updatePayload.nameEn = validatedData.nameEn;
    if (validatedData.streetAddress !== undefined)
      updatePayload.streetAddress = validatedData.streetAddress;
    if (validatedData.district !== undefined)
      updatePayload.district = validatedData.district;
    if (validatedData.city !== undefined)
      updatePayload.city = validatedData.city;
    if (validatedData.isActive !== undefined)
      updatePayload.isActive = validatedData.isActive;

    const data = await adminApiClient.warehouses.update(id, updatePayload);
    revalidatePath("/warehouses");
    revalidatePath(`/warehouses/${id}`);
    return { success: true as const, data };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[updateWarehouseAction]", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("updateWarehouseFailed"),
    };
  }
}

export async function deleteWarehouseAction(id: string) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(id)) {
    return { success: false as const, error: t("default") };
  }
  try {
    await requireAuth();
    await adminApiClient.warehouses.delete(id);
    revalidatePath("/warehouses");
    return { success: true as const };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[deleteWarehouseAction]", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("deleteWarehouseFailed"),
    };
  }
}
