"use server";

import {
  assertFinanceRole,
  getAuthErrorMessage,
  AuthError,
} from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";
import {
  updateCustomerTierSchema,
  type UpdateCustomerTierInput,
} from "@/shared/validators";

export const createDealerTierAction = async (_formData: FormData) => {
  const t = await getTranslations("errors");
  try {
    await assertFinanceRole();
    return {
      success: false as const,
      error: t("createDealerTierFailed"),
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    return {
      success: false as const,
      error: t("createDealerTierFailed"),
    };
  }
};

export const updateCustomerTierAction = async (
  _userId: string,
  payload: UpdateCustomerTierInput,
) => {
  const t = await getTranslations("errors");
  const parsed = updateCustomerTierSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false as const,
      error: t("validationError"),
    };
  }
  return { success: true as const };
};
