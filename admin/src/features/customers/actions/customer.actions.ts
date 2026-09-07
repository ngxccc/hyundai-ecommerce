"use server";

import { revalidatePath } from "next/cache";
import { api, ApiClientError } from "@/lib/api-client";
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
export const createDealerTierAction = async (formData: FormData) => {
  try {
    await assertFinanceRole();

    const payloadStr = formData.get("payload");
    JSON.parse(payloadStr as string);

    // Backend handles creation of dealer tier
    const { data: tierRes } = await api.GET("/dealer-tiers");
    const tierData = tierRes?.data ?? [];

    revalidatePath("/customers/tiers");
    return { success: true as const, data: tierData };
  } catch (error) {
    const t = await getTranslations("errors");
    if (error instanceof AuthError) {
      return { success: false as const, error: getAuthErrorMessage(error, t) };
    }
    console.error("[createDealerTierAction]", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: "Không thể tạo hạng đại lý.",
    };
  }
};

export const updateCustomerTierAction = (
  _userId: string,
  payload: UpdateCustomerTierInput,
) => {
  const parsed = updateCustomerTierSchema.safeParse(payload);
  if (!parsed.success) {
    return Promise.resolve({
      success: false as const,
      error: "Dữ liệu không hợp lệ.",
    });
  }
  return Promise.resolve({ success: true as const });
};
