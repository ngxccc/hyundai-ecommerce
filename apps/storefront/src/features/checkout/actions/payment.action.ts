"use server";

import { getCachedSession } from "@/shared/lib/session";
import { getTranslations } from "next-intl/server";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import {
  getPayOSPaymentLinkInformation,
  PAYOS_SUCCESS_CODE,
} from "@nhatnang/shared/lib/payos";
import { paymentService, orderService } from "@nhatnang/database/services";

export async function reVerifyPaymentAction(orderId: string) {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  // 1. Cooldown rate limit (max 1 verification request per 30 seconds per order)
  const cooldownKey = `ratelimit:re-verify-payment:${orderId}`;
  const rateLimitResult = await checkRateLimitWithQueue(cooldownKey, 1, "30 s");
  if (!rateLimitResult.success) {
    return { success: false as const, error: t("rateLimitExceeded") };
  }

  try {
    // 2. Fetch the order
    const order = await orderService.getComplexOrder(orderId);

    if (!order) {
      return { success: false as const, error: t("orderNotFound") };
    }

    // 3. IDOR Guard: verify ownership
    if (order.userId !== session.user.id) {
      return { success: false as const, error: t("forbidden") };
    }

    // If already paid, return early
    if (
      order.paymentStatus === "DEPOSIT_PAID" ||
      order.paymentStatus === "FULLY_PAID"
    ) {
      return { success: true as const, status: "PAID" };
    }

    // 4. Fetch the pending PayOS transaction
    const pendingTx = await paymentService.getPendingPayOSTransactionByOrderId(orderId);

    if (!pendingTx?.orderCode) {
      return {
        success: false as const,
        error: t("paymentTransactionNotFound"),
      };
    }

    // 5. Query PayOS directly
    const payosRes = await getPayOSPaymentLinkInformation(pendingTx.orderCode);

    if (payosRes.code !== PAYOS_SUCCESS_CODE || !payosRes.data) {
      return {
        success: false as const,
        error: t("paymentGatewayConnectionFailed"),
      };
    }

    const { status, amountPaid, transactions } = payosRes.data;

    // 6. Handle PAID status
    if (status === "PAID") {
      const reference = transactions?.[0]?.reference ?? "manual-reverify";
      const updated = await paymentService.confirmPayOSPayment(
        String(pendingTx.orderCode),
        amountPaid,
        reference,
      );

      if (updated) {
        return { success: true as const, status: "PAID" };
      }
    }

    // 7. Handle CANCELLED/EXPIRED status
    if (status === "CANCELLED" || status === "EXPIRED") {
      await paymentService.updatePaymentTransactionStatus(pendingTx.id, "FAILED");

      return { success: true as const, status: "FAILED" };
    }

    return { success: true as const, status };
  } catch (error) {
    console.error("[reVerifyPaymentAction error]", error);
    return {
      success: false as const,
      error: t("paymentGatewayConnectionFailed"),
    };
  }
}
