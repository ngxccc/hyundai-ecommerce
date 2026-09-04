"use server";

import { apiClient, ApiClientError } from "@/lib/api-client";

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
  if (!data.customerName || !data.customerPhone) {
    return {
      success: false as const,
      error: "Vui lòng nhập đầy đủ họ tên và số điện thoại liên hệ.",
    };
  }

  if (!data.items || data.items.length === 0) {
    return {
      success: false as const,
      error: "Danh sách sản phẩm yêu cầu báo giá không được để trống.",
    };
  }

  try {
    const quote = await apiClient.quotes.createQuote({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail ?? null,
      companyName: data.companyName ?? null,
      taxId: data.taxId ?? null,
      shippingAddress: data.shippingAddress ?? null,
      note: data.note ?? null,
      items: data.items,
    });

    return {
      success: true as const,
      data: quote,
    };
  } catch (error) {
    console.error("[submitQuoteRequestAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return {
        success: false as const,
        error: error.problem.detail,
      };
    }
    return {
      success: false as const,
      error:
        "Không thể gửi yêu cầu báo giá. Vui lòng liên hệ hotline để được hỗ trợ trực tiếp.",
    };
  }
}
