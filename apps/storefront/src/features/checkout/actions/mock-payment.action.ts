"use server";

import { env } from "@/env";
import { getCachedSession } from "@/shared/lib/session";
import { getTranslations } from "next-intl/server";
import { generatePayOSSignature } from "@nhatnang/shared";
import { paymentService, orderService } from "@nhatnang/database/services";

export async function simulatePayOSWebhookAction(
  orderCode: string,
  amount: number,
  actionType: "success" | "amount_mismatch",
) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Unauthorized");
  }
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);
  if (!session?.user) {
    return { success: false, error: t("unauthorized") };
  }

  try {
    const finalAmount =
      actionType === "amount_mismatch" ? amount - 1000 : amount;
    const data = {
      orderCode: parseInt(orderCode, 10),
      amount: finalAmount,
      description: "Mock PayOS simulation",
      reference:
        "MOCK_REF_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      accountNumber: "123456789",
      bin: "970415",
      transactionDateTime: new Date().toISOString(),
      paymentLinkId: "mock_link_id",
      code: "00",
      desc: "success",
    };

    const signature = generatePayOSSignature(data, env.PAYOS_CHECKSUM_KEY);

    const webhookUrl = `${env.NEXT_PUBLIC_APP_URL}/api/payments/payos-webhook`;
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: "00",
        desc: "success",
        data,
        signature,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[simulatePayOSWebhookAction failed]", text);
      return { success: false, error: `Webhook status ${res.status}: ${text}` };
    }

    return { success: true };
  } catch (error) {
    console.error("[simulatePayOSWebhookAction error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function getMockPaymentDetailsAction(orderCodeOrId: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Unauthorized");
  }
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);
  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  try {
    // 1. Try to treat orderCodeOrId as orderId (UUID) first
    const isUuid = orderCodeOrId.includes("-") && orderCodeOrId.length === 36;
    if (isUuid) {
      const tx =
        await paymentService.getPendingPayOSTransactionByOrderId(orderCodeOrId);
      if (tx) {
        return {
          success: true as const,
          type: "order" as const,
          amount: parseFloat(tx.amount),
          orderId: orderCodeOrId,
          orderCode: String(tx.orderCode),
        };
      }
    }

    // 2. Otherwise, treat as numeric orderCode
    const codeNum = parseInt(orderCodeOrId, 10);
    if (isNaN(codeNum)) {
      return { success: false as const, error: t("invalidOrderCode") };
    }

    // 2a. Check payment transaction table
    const tx = await paymentService.getPaymentTransactionByOrderCode(codeNum);
    if (tx) {
      return {
        success: true as const,
        type: "order" as const,
        amount: parseFloat(tx.amount),
        orderId: tx.orderId,
        orderCode: String(tx.orderCode),
      };
    }

    // 2b. Check debt repayment table
    const repayment = await paymentService.getDebtRepaymentByOrderCode(codeNum);
    if (repayment) {
      return {
        success: true as const,
        type: "debt" as const,
        amount: parseFloat(repayment.amount),
        userId: repayment.userId,
        orderCode: String(repayment.orderCode),
      };
    }

    return { success: false as const, error: t("paymentTransactionNotFound") };
  } catch (error) {
    console.error("[getMockPaymentDetailsAction error]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : t("internalServerError"),
    };
  }
}

export async function getRecentPendingTransactionsAction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Unauthorized");
  }
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);
  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  try {
    const orders = await orderService.listUserOrders(session.user.id);
    const eligibleOrders = [];

    for (const order of orders) {
      const tx = await paymentService.getPendingPayOSTransactionByOrderId(
        order.id,
      );
      if (tx) {
        eligibleOrders.push({
          id: order.id,
          orderCode: String(tx.orderCode),
          amount: parseFloat(tx.amount),
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          status: order.status,
        });
      }
    }

    const repayments = await paymentService.getDebtRepaymentsByUserId(
      session.user.id,
    );
    const eligibleRepayments = repayments
      .filter((r) => r.status === "PENDING")
      .map((r) => ({
        id: r.id,
        orderCode: String(r.orderCode),
        amount: parseFloat(r.amount),
        status: r.status,
      }));

    return {
      success: true as const,
      orders: eligibleOrders,
      repayments: eligibleRepayments,
    };
  } catch (error) {
    console.error("[getRecentPendingTransactionsAction error]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : t("internalServerError"),
    };
  }
}

export async function simulatePayOSCancelAction(orderCode: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Unauthorized");
  }
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
      await paymentService.updatePaymentTransactionStatus(tx.id, "FAILED");
      return {
        success: true as const,
        type: "order" as const,
        orderId: tx.orderId,
      };
    }

    // 2. Check debt repayment table
    const repayment = await paymentService.getDebtRepaymentByOrderCode(codeNum);
    if (repayment) {
      await paymentService.updateDebtRepayment(repayment.id, {
        status: "FAILED",
      });
      return {
        success: true as const,
        type: "debt" as const,
        userId: repayment.userId,
      };
    }

    return { success: false as const, error: t("paymentTransactionNotFound") };
  } catch (error) {
    console.error("[simulatePayOSCancelAction error]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : t("internalServerError"),
    };
  }
}

export async function simulatePayOSMismatchAction(
  orderCode: string,
  amount: number,
) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Unauthorized");
  }
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);
  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  try {
    const finalAmount = amount - 1000;
    const data = {
      orderCode: parseInt(orderCode, 10),
      amount: finalAmount,
      description: "Mock PayOS mismatch simulation",
      reference:
        "MOCK_REF_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      accountNumber: "123456789",
      bin: "970415",
      transactionDateTime: new Date().toISOString(),
      paymentLinkId: "mock_link_id",
      code: "00",
      desc: "success",
    };

    const signature = generatePayOSSignature(data, env.PAYOS_CHECKSUM_KEY);

    const webhookUrl = `${env.NEXT_PUBLIC_APP_URL}/api/payments/payos-webhook`;
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: "00",
        desc: "success",
        data,
        signature,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[simulatePayOSMismatchAction failed]", text);
      return {
        success: false as const,
        error: `Webhook status ${res.status}: ${text}`,
      };
    }

    // Get the order ID to return
    const codeNum = parseInt(orderCode, 10);
    const tx = await paymentService.getPaymentTransactionByOrderCode(codeNum);
    if (tx) {
      await paymentService.updatePaymentTransactionStatus(tx.id, "FAILED");
      return {
        success: true as const,
        type: "order" as const,
        orderId: tx.orderId,
      };
    }

    return { success: true as const, type: "debt" as const };
  } catch (error) {
    console.error("[simulatePayOSMismatchAction error]", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : t("internalServerError"),
    };
  }
}
