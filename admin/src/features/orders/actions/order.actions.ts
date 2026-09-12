"use server";

import { revalidatePath } from "next/cache";
import { ApiClientError } from "@/lib/api-client";
import { ordersApi } from "../api/orders.api";
import { paymentsApi } from "@/features/payments/api/payments.api";
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
    const { data: updated, error } = await ordersApi.updateStatus(orderId, {
      status,
      note,
    });
    if (error) {
      throw new ApiClientError(error.detail, error.status, error);
    }
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
    const { data: result, error } = await ordersApi.updateStatus(orderId, {
      status: "PROCESSING",
      note: "Duyệt đơn hàng đại lý",
    });
    if (error) {
      throw new ApiClientError(error.detail, error.status, error);
    }
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
    const { data: result, error } = await paymentsApi.verifyCash(orderId, {
      amount,
      note: note ?? "Kế toán xác nhận thu tiền mặt",
    });
    if (error) {
      throw new ApiClientError(error.detail, error.status, error);
    }
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
    const { data: result, error } = await ordersApi.cancel(orderId);
    if (error) {
      throw new ApiClientError(error.detail, error.status, error);
    }
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
