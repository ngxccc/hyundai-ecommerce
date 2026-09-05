"use server";

import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api-client";

export interface SubmitQuoteItemInput {
  productId?: string | null;
  isCustomItem?: boolean;
  itemName: string;
  itemModel?: string | null;
  itemSpecs?: string | null;
  quantity: number;
  requestedPrice?: string | null;
}

export interface SubmitQuoteInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  companyName?: string | null;
  taxId?: string | null;
  shippingAddress?: string | null;
  note?: string | null;
  items: SubmitQuoteItemInput[];
}

export async function submitQuoteRequestAction(data: SubmitQuoteInput) {
  const t = await getTranslations("Quote");

  if (!data.customerName || !data.customerPhone) {
    return {
      success: false as const,
      error: t("contactInfoRequired"),
    };
  }

  if (data.items.length === 0) {
    return {
      success: false as const,
      error: t("emptyItemsRequired"),
    };
  }

  try {
    const { data: res } = await api.POST("/quotes", {
      body: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail ?? undefined,
        companyName: data.companyName ?? undefined,
        taxId: data.taxId ?? undefined,
        shippingAddress: data.shippingAddress ?? undefined,
        note: data.note ?? undefined,
        items: data.items.map((item) => ({
          productId: item.productId ?? undefined,
          isCustomItem: (item.isCustomItem ?? false) as unknown as Record<
            string,
            never
          >,
          itemName: item.itemName,
          itemModel: item.itemModel ?? undefined,
          itemSpecs: item.itemSpecs ?? undefined,
          quantity: item.quantity,
          requestedPrice: item.requestedPrice ?? undefined,
        })),
      },
    });

    if (!res?.data) {
      return {
        success: false as const,
        error: t("createFailed"),
      };
    }

    return {
      success: true as const,
      data: res.data,
    };
  } catch (error) {
    console.error("[submitQuoteRequestAction] Error:", error);
    return {
      success: false as const,
      error: t("submitError"),
    };
  }
}
