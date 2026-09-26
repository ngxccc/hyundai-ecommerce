"use server";

import { revalidatePath } from "next/cache";
import { ApiClientError } from "@/lib/api-client";
import { quotesApi } from "../api/quotes.api";
import { getTranslations } from "next-intl/server";
import { formatFieldErrors, formatValidationErrors } from "@/lib/validation";
import {
  isValidIdentifier,
  createAdminQuoteSchema,
  updateQuoteStatusSchema,
  type CreateAdminQuoteInput,
  type UpdateQuoteStatusInput,
} from "@/validators";

export async function approveAndConvertToOrderAction(quoteId: string) {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(quoteId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    const { data, error } = await quotesApi.approveToOrder(quoteId);
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
    const { data, error } = await quotesApi.updateStatus(quoteId, {
      status: parsedStatus.data.status,
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
    const { data, error } = await quotesApi.updateItemPrice(quoteId, itemId, {
      agreedPrice,
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

export async function createAdminQuoteAction(rawInput: CreateAdminQuoteInput) {
  const t = await getTranslations("errors");
  const parsed = createAdminQuoteSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors = formatValidationErrors(parsed.error, (key, args) =>
      t(key, args),
    );
    const flatErrors = formatFieldErrors(parsed.error, (key, args) =>
      t(key, args),
    );
    const firstErrorMessage =
      Object.values(flatErrors)[0] || t("createQuoteFailed");
    return {
      success: false as const,
      error: firstErrorMessage,
      fieldErrors,
    };
  }
  const dto = parsed.data;
  try {
    const { data, error } = await quotesApi.createAdmin({
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
            deliveryLocation: dto.commercialTerms.deliveryLocation ?? undefined,
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
      const fieldErrors: Record<string, string[]> = {};
      if (Array.isArray(error.problem.invalidParams)) {
        for (const param of error.problem.invalidParams) {
          if (param.name && param.reason) {
            fieldErrors[param.name] = [param.reason];
          }
        }
      }
      return {
        success: false as const,
        error: error.problem.detail,
        fieldErrors:
          Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      };
    }
    return {
      success: false as const,
      error: t("createQuoteFailed"),
      fieldErrors: undefined,
    };
  }
}
