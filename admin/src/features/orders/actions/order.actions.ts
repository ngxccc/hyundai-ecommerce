"use server";

import { revalidatePath } from "next/cache";
import { api, ApiClientError } from "@/lib/api-client";
import type { AdminOrder } from "@/types/api";
import { isValidIdentifier } from "@/shared/validators";
import {
  requireAuth,
  assertFinanceRole,
  assertSalesOrFinanceRole,
} from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";

export const updateOrderStatusAction = async (
  orderId: string,
  status: AdminOrder["status"],
  note?: string,
) => {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(orderId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    await requireAuth();
    const { data: updated } = await api.PATCH("/orders/{id}/status", {
      params: { path: { id: orderId } },
      body: { status, note },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return {
      success: true as const,
      data: updated,
    };
  } catch (error) {
    console.error("[updateOrderStatusAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("updateOrderStatusFailed"),
    };
  }
};

export const approveDealerOrderAction = async (orderId: string) => {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(orderId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    await assertSalesOrFinanceRole();
    const { data: result } = await api.PATCH("/orders/{id}/status", {
      params: { path: { id: orderId } },
      body: { status: "PROCESSING", note: "Duyệt đơn hàng đại lý" },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return {
      success: true as const,
      data: result,
    };
  } catch (error) {
    console.error("[approveDealerOrderAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("approveDealerOrderFailed"),
    };
  }
};

export const verifyCashPaymentAction = async (
  orderId: string,
  amount = 0,
  note?: string,
) => {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(orderId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    await assertFinanceRole();
    const { data: result } = await api.POST("/payments/{id}/verify-cash", {
      params: { path: { id: orderId } },
      body: {
        amount: amount as never,
        note: note ?? "Kế toán xác nhận thu tiền mặt",
      },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return {
      success: true as const,
      data: result,
    };
  } catch (error) {
    console.error("[verifyCashPaymentAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("verifyCashPaymentFailed"),
    };
  }
};

export const approveOrderCancellationAction = async (
  orderId: string,
  _reason?: string,
) => {
  const t = await getTranslations("errors");
  if (!isValidIdentifier(orderId)) {
    return { success: false as const, error: t("default") };
  }
  try {
    await assertSalesOrFinanceRole();
    const { data: result } = await api.POST("/orders/{id}/cancel", {
      params: { path: { id: orderId } },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return {
      success: true as const,
      data: result,
    };
  } catch (error) {
    console.error("[approveOrderCancellationAction] Error:", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }
    return {
      success: false as const,
      error: t("approveOrderCancellationFailed"),
    };
  }
};

export const selectShippingBidAction = async (
  _orderId: string,
  _bidId: string,
): Promise<{ success: true } | { success: false; error: string }> => {
  return Promise.resolve({ success: true });
};

export const addShippingBidAction = async (
  _data: Record<string, unknown>,
): Promise<{ success: true } | { success: false; error: string }> => {
  return Promise.resolve({ success: true });
};
