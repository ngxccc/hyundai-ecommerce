"use server";

import { revalidatePath } from "next/cache";
import { adminApiClient, ApiClientError } from "@/lib/api-client";
import { getTranslations } from "next-intl/server";

export async function approveAndConvertToOrderAction(quoteId: string) {
  const t = await getTranslations("errors");
  try {
    const data = await adminApiClient.quotes.approveToOrder(quoteId);
    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}`);
    revalidatePath("/orders");
    return { success: true as const, data };
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
  try {
    const data = await adminApiClient.quotes.updateStatus(quoteId, status);
    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}`);
    return { success: true as const, data };
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
  try {
    const data = await adminApiClient.quotes.updateItemPrice(
      quoteId,
      itemId,
      agreedPrice,
    );
    revalidatePath(`/quotes/${quoteId}`);
    return { success: true as const, data };
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
  try {
    const data = await adminApiClient.quotes.sendMessage(quoteId, message);
    revalidatePath(`/quotes/${quoteId}`);
    return { success: true as const, data };
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
    const data = await adminApiClient.quotes.createAdminQuote(dto);
    revalidatePath("/quotes");
    return { success: true as const, data };
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
