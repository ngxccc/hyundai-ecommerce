"use server";

import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { ApiClientError } from "@/lib/api-client";
import { companySettingsApi } from "../api/company-settings.api";
import {
  updateCompanySettingsInputSchema,
  type UpdateCompanySettingsInput,
} from "@/validators";
import { formatValidationErrors } from "@/lib/validation";
import { SYSTEM_ERROR_CODES } from "@/constants";
import {
  assertRole,
  getAuthErrorMessage,
  getActionErrorMessage,
  AuthError,
} from "@/lib/action-auth";
import { getTranslations } from "next-intl/server";

export async function updateCompanySettingsAction(
  input: UpdateCompanySettingsInput,
) {
  const t = await getTranslations("errors");
  try {
    await assertRole(["ADMIN"]);
    const parsed = await updateCompanySettingsInputSchema.safeParseAsync(input);

    if (!parsed.success) {
      return {
        success: false as const,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: formatValidationErrors(parsed.error, (k) => t(k)),
      };
    }

    const { data, error } = await companySettingsApi.update(parsed.data);
    if (error) {
      throw new ApiClientError(error.detail, error.status, error);
    }

    // Invalidate company settings cache tag and UI paths across admin
    updateTag("company-settings");
    revalidateTag("company-settings", "max");
    revalidatePath("/settings/company");
    revalidatePath("/quotes", "layout");
    return { success: true as const, data };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: getAuthErrorMessage(error, (key) => t(key as never)),
      };
    }
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: getActionErrorMessage(error, (key) => t(key as never), "default"),
    };
  }
}
