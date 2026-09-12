"use server";

import { getTranslations } from "next-intl/server";
import { quoteApi } from "../api/quote.api";
import { translateZodMessage } from "@/shared/lib/i18n-zod";
import {
  submitQuoteSchema,
  type SubmitQuoteInput,
  type SubmitQuoteItemInput,
} from "../schemas/quote.schema";

export type { SubmitQuoteInput, SubmitQuoteItemInput };

export async function submitQuoteRequestAction(rawInput: SubmitQuoteInput) {
  const t = await getTranslations("Quote");
  const tRoot = await getTranslations();
  const parsed = submitQuoteSchema.safeParse(rawInput);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const errorMessage = translateZodMessage(firstIssue.message, (key, args) =>
      tRoot(key, args),
    );

    return {
      success: false as const,
      error: errorMessage || t("submitError"),
    };
  }

  const data = parsed.data;

  try {
    const res = await quoteApi.create({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail ?? undefined,
      companyName: data.companyName ?? undefined,
      taxId: data.taxId ?? undefined,
      shippingAddress: data.shippingAddress ?? undefined,
      note: data.note ?? undefined,
      items: data.items.map((item) => ({
        productId: item.productId ?? undefined,
        isCustomItem: item.isCustomItem ?? false,
        itemName: item.itemName,
        itemModel: item.itemModel ?? undefined,
        itemSpecs: item.itemSpecs ?? undefined,
        quantity: item.quantity,
        requestedPrice: item.requestedPrice ?? undefined,
      })),
    });

    const errorPayload = res.error;
    const quoteData = res.data?.data;
    if (errorPayload || !quoteData) {
      return {
        success: false as const,
        error: errorPayload?.detail ?? t("createFailed"),
      };
    }

    return {
      success: true as const,
      data: quoteData,
    };
  } catch (error) {
    console.error("[submitQuoteRequestAction] Error:", error);
    return {
      success: false as const,
      error: t("submitError"),
    };
  }
}
