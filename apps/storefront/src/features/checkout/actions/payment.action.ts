"use server";

import { env } from "@/env";
import { getCachedSession } from "@/shared/lib/session";
import { getTranslations } from "next-intl/server";
import {
  checkRateLimitWithQueue,
  isOverdueLocked,
  createPayOSPaymentLink,
  generatePayOSOrderCode,
} from "@nhatnang/shared";
import {
  getPayOSPaymentLinkInformation,
  PAYOS_SUCCESS_CODE,
  makePayOSDescription,
  cancelPayOSPaymentLink,
} from "@nhatnang/shared/lib/payos";
import {
  paymentService,
  orderService,
  userService,
} from "@nhatnang/database/services";
import type {
  OrderPaymentStatus,
  OrderStatus,
  PaymentMethod,
} from "@nhatnang/database/schemas";
import type { PaymentTransactionDetailsDTO } from "@nhatnang/database/dtos";

export interface OrderSuccessItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderSuccessDetails {
  id: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderPaymentStatus;
  status: OrderStatus;
  shippingFee: number;
  shippingAddress: string | null;
  items: OrderSuccessItem[];
}

export interface PaymentTransactionDetails extends Omit<
  PaymentTransactionDetailsDTO,
  "amount"
> {
  amount: number;
}

export interface GetOrderSuccessDetailsResult {
  success: boolean;
  error?: string;
  order?: OrderSuccessDetails;
  transaction?: PaymentTransactionDetails | null;
  isB2B?: boolean;
}

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
    const pendingTx =
      await paymentService.getPendingPayOSTransactionByOrderId(orderId);

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
      await paymentService.updatePaymentTransactionStatus(
        pendingTx.id,
        "FAILED",
      );

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


export async function getB2BProfileWithLockAction() {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);
  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  try {
    const user = await userService.getB2BProfile(session.user.id);
    if (!user) {
      return { success: false as const, error: t("userNotFound") };
    }

    const isLocked = await isOverdueLocked(session.user.id);

    return {
      success: true as const,
      profile: {
        ...user,
        isLocked,
      },
    };
  } catch (error) {
    console.error("[getB2BProfileWithLockAction error]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : t("internalServerError"),
    };
  }
}

export async function getPaymentDetailsByOrderCodeAction(orderCode: string) {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);
  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  try {
    const codeNum = parseInt(orderCode, 10);
    if (isNaN(codeNum)) {
      return { success: false as const, error: t("invalidOrderCode") };
    }

    // 1. Check payment transaction table
    const tx = await paymentService.getPaymentTransactionByOrderCode(codeNum);
    if (tx) {
      const order = await orderService.getComplexOrder(tx.orderId);
      if (order?.userId !== session.user.id) {
        return { success: false as const, error: t("forbidden") };
      }

      return {
        success: true as const,
        type: "order" as const,
        amount: parseFloat(tx.amount),
        orderId: tx.orderId,
        orderCode: String(tx.orderCode),
        status: tx.status,
      };
    }

    // 2. Check debt repayment table
    const repayment = await paymentService.getDebtRepaymentByOrderCode(codeNum);
    if (repayment) {
      if (repayment.userId !== session.user.id) {
        return { success: false as const, error: t("forbidden") };
      }

      return {
        success: true as const,
        type: "debt" as const,
        amount: parseFloat(repayment.amount),
        userId: repayment.userId,
        orderCode: String(repayment.orderCode),
        status: repayment.status,
      };
    }

    return { success: false as const, error: t("paymentTransactionNotFound") };
  } catch (error) {
    console.error("[getPaymentDetailsByOrderCodeAction error]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : t("internalServerError"),
    };
  }
}

export async function regenerateOrderPaymentLinkAction(orderId: string) {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);
  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  // Rate limit link regeneration (max 3 times per 30 seconds per order)
  const cooldownKey = `ratelimit:regenerate-payment-link:${orderId}`;
  const rateLimitResult = await checkRateLimitWithQueue(cooldownKey, 3, "30 s");
  if (!rateLimitResult.success) {
    return { success: false as const, error: t("rateLimitExceeded") };
  }

  try {
    const order = await orderService.getComplexOrder(orderId);
    if (order?.userId !== session.user.id) {
      return { success: false as const, error: t("orderNotFound") };
    }

    if (order.paymentStatus !== "UNPAID") {
      return { success: false as const, error: t("orderAlreadyPaid") };
    }

    // Generate new payment link
    const orderCode = generatePayOSOrderCode();

    // Save a new pending payment transaction record
    const txAmount = parseFloat(order.totalAmount);
    // Find if it was a deposit or full payment
    const pendingTx =
      await paymentService.getPendingPayOSTransactionByOrderId(orderId);
    const transactionType = pendingTx?.transactionType ?? "FULL";
    const finalAmount =
      transactionType === "DEPOSIT" ? txAmount * 0.2 : txAmount;

    await paymentService.createPaymentTransaction({
      orderId: order.id,
      amount: String(finalAmount),
      paymentMethod: "PAYOS",
      transactionType,
      status: "PENDING",
      orderCode,
    });

    const isMockPayment =
      env.FORCE_MOCK_PAYMENT === "true" ||
      (env.FORCE_MOCK_PAYMENT !== "false" &&
        process.env.NODE_ENV !== "production");

    if (
      !isMockPayment &&
      env.PAYOS_CLIENT_ID !== "mock_client_id" &&
      env.PAYOS_API_KEY !== "mock_api_key" &&
      !env.PAYOS_CLIENT_ID.startsWith("mock")
    ) {
      const result = await createPayOSPaymentLink({
        orderCode,
        amount: Math.round(finalAmount),
        description: makePayOSDescription("full", orderCode),
        cancelUrl: `${env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
        returnUrl: `${env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      });

      if (result?.code === PAYOS_SUCCESS_CODE) {
        // Registered successfully, but keep checkoutUrl pointing to our success/mock page
      } else {
        return {
          success: false as const,
          error: t("payosLinkCreationFailed"),
        };
      }
    }

    const finalCheckoutUrl = isMockPayment
      ? `${env.NEXT_PUBLIC_APP_URL}/checkout/mock-payment?orderCode=${orderCode}`
      : `${env.NEXT_PUBLIC_APP_URL}/checkout/pay?orderId=${order.id}`;

    return { success: true as const, checkoutUrl: finalCheckoutUrl };
  } catch (error) {
    console.error("[regenerateOrderPaymentLinkAction error]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : t("internalServerError"),
    };
  }
}

export async function getOrderSuccessDetailsAction(
  orderId: string,
): Promise<GetOrderSuccessDetailsResult> {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);
  if (!session?.user) {
    return { success: false, error: t("unauthorized") };
  }
  try {
    const order = await orderService.getComplexOrder(orderId);
    if (!order) {
      return { success: false, error: t("orderNotFound") };
    }
    if (order.userId !== session.user.id) {
      return { success: false, error: t("forbidden") };
    }

    const isAmountMismatch = order.status === "SUSPICIOUS_PAYMENT_HOLD";
    const tx = isAmountMismatch
      ? await paymentService.getLastPayOSTransactionByOrderId(orderId)
      : await paymentService.getPendingPayOSTransactionByOrderId(orderId);

    return {
      success: true,
      isB2B: order.user?.businessType !== "END_USER",
      order: {
        id: order.id,
        totalAmount: parseFloat(order.totalAmount),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        shippingFee: parseFloat(order.shippingFee ?? "0"),
        shippingAddress: order.shippingAddress,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
        })),
      },
      transaction: tx
        ? {
            id: tx.id,
            amount: parseFloat(tx.amount),
            status: tx.status,
            orderCode: tx.orderCode,
            transactionType: tx.transactionType,
            createdAt: tx.createdAt,
          }
        : null,
    };
  } catch (error) {
    console.error("[getOrderSuccessDetailsAction error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t("internalServerError"),
    };
  }
}

export async function cancelOrderPaymentLinkAction(
  orderId: string,
  reason?: string,
) {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  try {
    // 1. Fetch the order
    const order = await orderService.getComplexOrder(orderId);

    if (!order) {
      return { success: false as const, error: t("orderNotFound") };
    }

    // 2. IDOR Guard: verify ownership
    if (order.userId !== session.user.id) {
      return { success: false as const, error: t("forbidden") };
    }

    // 3. Fetch the pending PayOS transaction
    const pendingTx =
      await paymentService.getPendingPayOSTransactionByOrderId(orderId);

    if (!pendingTx?.orderCode) {
      return {
        success: false as const,
        error: t("paymentTransactionNotFound"),
      };
    }

    const isMockPayment =
      env.FORCE_MOCK_PAYMENT === "true" ||
      (env.FORCE_MOCK_PAYMENT !== "false" &&
        process.env.NODE_ENV !== "production");

    // 4. Cancel on PayOS if not mock
    if (
      !isMockPayment &&
      env.PAYOS_CLIENT_ID !== "mock_client_id" &&
      env.PAYOS_API_KEY !== "mock_api_key" &&
      !env.PAYOS_CLIENT_ID.startsWith("mock")
    ) {
      try {
        const payosRes = await cancelPayOSPaymentLink(
          pendingTx.orderCode,
          reason ?? "User cancelled payment",
        );

        if (payosRes.code !== PAYOS_SUCCESS_CODE) {
          return {
            success: false as const,
            error: t("paymentGatewayConnectionFailed"),
          };
        }
      } catch (error) {
        console.error(
          "PayOS cancellation failed, updating local state anyway:",
          error,
        );
      }
    }

    // 5. Update local database transaction status to FAILED (cancelled)
    await paymentService.updatePaymentTransactionStatus(pendingTx.id, "FAILED");

    return {
      success: true as const,
      orderCode: String(pendingTx.orderCode),
    };
  } catch (error) {
    console.error("[cancelOrderPaymentLinkAction error]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : t("internalServerError"),
    };
  }
}
