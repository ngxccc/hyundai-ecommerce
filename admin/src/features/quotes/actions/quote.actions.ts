"use server";

import { revalidatePath } from "next/cache";
import { api, ApiClientError } from "@/lib/api-client";
import { getTranslations } from "next-intl/server";
import { translateZodMessage } from "@/shared/lib/i18n-zod";
import {
  isValidIdentifier,
  createAdminQuoteSchema,
  updateQuoteStatusSchema,
  type CreateAdminQuoteInput,
  type UpdateQuoteStatusInput,
} from "@/shared/validators";

export async function approveAndConvertToOrderAction(quoteId: string) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(quoteId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    const { data, error } = await api.POST(
      "/api/v1/quotes/{id}/approve-to-order",
      {
        params: { path: { id: quoteId } },
      },
    );
    const res = data?.data;
    if (error || !res) {
      throw new ApiClientError(
        error?.detail ?? t("quoteNotEditableOrConvertible"),
        error?.status ?? 400,
        error,
      );
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

export async function updateQuoteStatusAction(
  quoteId: string,
  status: UpdateQuoteStatusInput["status"],
) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(quoteId)) {
    return { success: false as const, error: t("default") };
  }
  const parsedStatus = updateQuoteStatusSchema.safeParse({ status });
  if (!parsedStatus.success) {
    return { success: false as const, error: t("default") };
  }
  try {
    const { data, error } = await api.PATCH("/api/v1/quotes/{id}/status", {
      params: { path: { id: quoteId } },
      body: { status: parsedStatus.data.status },
    });
    const res = data?.data;
    if (error || !res) {
      throw new ApiClientError(
        error?.detail ?? t("default"),
        error?.status ?? 400,
        error,
      );
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
    const { data, error } = await api.PUT(
      "/api/v1/quotes/{id}/items/{itemId}/price",
      {
        params: { path: { id: quoteId, itemId } },
        body: { agreedPrice },
      },
    );
    const res = data?.data;
    if (error || !res) {
      throw new ApiClientError(
        error?.detail ?? t("default"),
        error?.status ?? 400,
        error,
      );
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
    const { data, error } = await api.POST("/api/v1/quotes/{id}/messages", {
      params: { path: { id: quoteId } },
      body: { message },
    });
    const res = data?.data;
    if (error || !res) {
      throw new ApiClientError(
        error?.detail ?? t("default"),
        error?.status ?? 400,
        error,
      );
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

export async function createAdminQuoteAction(rawInput: CreateAdminQuoteInput) {
  const t = await getTranslations("errors");
  const parsed = createAdminQuoteSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const errorMessage = translateZodMessage(firstIssue.message, (key, args) =>
      t(key, args),
    );
    return {
      success: false as const,
      error: errorMessage || t("createQuoteFailed"),
      fieldErrors: undefined,
    };
  }
  const dto = parsed.data;
  try {
    const { data, error } = await api.POST("/api/v1/quotes/admin", {
      body: {
        userId: dto.userId ?? undefined,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail ?? undefined,
        companyName: dto.companyName ?? undefined,
        taxId: dto.taxId ?? undefined,
        shippingAddress: dto.shippingAddress ?? undefined,
        vatRate: dto.vatRate,
        commercialTerms: dto.commercialTerms
          ? {
              validityDays: dto.commercialTerms.validityDays,
              paymentSchedule: dto.commercialTerms.paymentSchedule ?? undefined,
              warrantyTerms: dto.commercialTerms.warrantyTerms ?? undefined,
              deliveryTime: dto.commercialTerms.deliveryTime ?? undefined,
              deliveryLocation:
                dto.commercialTerms.deliveryLocation ?? undefined,
            }
          : undefined,
        note: dto.note ?? undefined,
        expirationDate: dto.expirationDate
          ? dto.expirationDate.toISOString()
          : undefined,
        items: dto.items.map((item) => ({
          productId: item.productId ?? undefined,
          isCustomItem: item.isCustomItem,
          itemName: item.itemName,
          itemModel: item.itemModel ?? undefined,
          itemSpecs: item.itemSpecs ?? undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
        })),
      },
    });
    const res = data?.data;
    if (error || !res) {
      throw new ApiClientError(
        error?.detail ?? t("createQuoteFailed"),
        error?.status ?? 400,
        error,
      );
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
