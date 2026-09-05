"use server";

import { revalidatePath } from "next/cache";
import { api, ApiClientError } from "@/lib/api-client";
import { getTranslations } from "next-intl/server";
import { isValidIdentifier } from "@/shared/validators";

export async function approveAndConvertToOrderAction(quoteId: string) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(quoteId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    const { data } = await api.POST("/quotes/{id}/approve-to-order", {
      params: { path: { id: quoteId } },
    });
    const res = data?.data;
    if (!res) {
      throw new ApiClientError(t("quoteNotEditableOrConvertible"), 400);
    }
    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}`);
    revalidatePath("/orders");
    return { success: true as const, data: res };
  } catch (error) {
    console.error("[approveAndConvertToOrderAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("quoteNotEditableOrConvertible"),
    };
  }
}

export async function updateQuoteStatusAction(quoteId: string, status: string) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(quoteId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    const { data } = await api.PATCH("/quotes/{id}/status", {
      params: { path: { id: quoteId } },
      body: { status: status as never },
    });
    const res = data?.data;
    if (!res) {
      throw new ApiClientError(t("default"), 400);
    }
    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}`);
    return { success: true as const, data: res };
  } catch (error) {
    console.error("[updateQuoteStatusAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("default"),
    };
  }
}

export async function updateQuoteItemPriceAction(
  quoteId: string,
  itemId: string,
  agreedPrice: string,
) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(quoteId) || !isValidIdentifier(itemId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    const { data } = await api.PUT("/quotes/{id}/items/{itemId}/price", {
      params: { path: { id: quoteId, itemId } },
      body: { agreedPrice },
    });
    const res = data?.data;
    if (!res) {
      throw new ApiClientError(t("default"), 400);
    }
    revalidatePath(`/quotes/${quoteId}`);
    return { success: true as const, data: res };
  } catch (error) {
    console.error("[updateQuoteItemPriceAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("default"),
    };
  }
}

export async function sendAdminNegotiationMessageAction(
  quoteId: string,
  message: string,
) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(quoteId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    const { data } = await api.POST("/quotes/{id}/messages", {
      params: { path: { id: quoteId } },
      body: { message },
    });
    const res = data?.data;
    if (!res) {
      throw new ApiClientError(t("default"), 400);
    }
    revalidatePath(`/quotes/${quoteId}`);
    return { success: true as const, data: res };
  } catch (error) {
    console.error("[sendAdminNegotiationMessageAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("default"),
    };
  }
}

export async function createAdminQuoteAction(dto: Record<string, unknown>) {
  const t = await getTranslations("errors");
  try {
    const { data } = await api.POST("/quotes/admin", {
      body: dto as never,
    });
    const res = data?.data;
    if (!res) {
      throw new ApiClientError(t("createQuoteFailed"), 400);
    }
    revalidatePath("/quotes");
    return { success: true as const, data: res };
  } catch (error) {
    console.error("[createAdminQuoteAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return {
        success: false as const,
        error: error.problem.detail,
        fieldErrors: undefined as Record<string, string[]> | undefined,
      };
    }
    return {
      success: false as const,
      error: t("createQuoteFailed"),
      fieldErrors: undefined as Record<string, string[]> | undefined,
    };
  }
}
