"use server";

import { getCachedSession } from "@/shared/lib/session";
import { paymentService, userService } from "@nhatnang/database/services";
import { env } from "@/env";
import {
  createPayOSPaymentLink,
  generatePayOSOrderCode,
  PAYOS_SUCCESS_CODE,
  makePayOSDescription,
} from "@nhatnang/shared";
import { getTranslations } from "next-intl/server";

export const generateRepaymentLinkAction = async (amount: number) => {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  // Only allow B2B dealers (approver and purchaser)
  const user = await userService.getB2BProfile(session.user.id);
  if (
    !user ||
    (user.role !== "DEALER_APPROVER" && user.role !== "DEALER_PURCHASER")
  ) {
    return { success: false as const, error: t("unauthorized") };
  }

  const currentDebt = parseFloat(user.currentDebt || "0");
  if (amount <= 0 || amount > currentDebt) {
    return { success: false as const, error: t("invalidAmount") };
  }

  try {
    const orderCode = generatePayOSOrderCode();

    // Create a pending debt repayment record
    await paymentService.createDebtRepayment({
      userId: session.user.id,
      amount: String(amount),
      paymentMethod: "PAYOS",
      status: "PENDING",
      orderCode,
    });

    let checkoutUrl = `${env.NEXT_PUBLIC_APP_URL}/checkout/mock-payment?orderCode=${orderCode}`;

    if (
      env.FORCE_MOCK_PAYMENT !== "true" &&
      env.PAYOS_CLIENT_ID !== "mock_client_id" &&
      env.PAYOS_API_KEY !== "mock_api_key" &&
      !env.PAYOS_CLIENT_ID.startsWith("mock")
    ) {
      const result = await createPayOSPaymentLink({
        orderCode,
        amount: Math.round(amount),
        description: makePayOSDescription("repay", orderCode),
        cancelUrl: `${env.NEXT_PUBLIC_APP_URL}/portal/debt?repaymentCancel=true`,
        returnUrl: `${env.NEXT_PUBLIC_APP_URL}/portal/debt?repaymentSuccess=true`,
      });

      if (result?.code === PAYOS_SUCCESS_CODE && result.data?.checkoutUrl) {
        checkoutUrl = result.data.checkoutUrl;
      } else {
        console.error("PayOS API error:", result);
        return { success: false as const, error: t("payosLinkCreationFailed") };
      }
    }

    return { success: true as const, checkoutUrl };
  } catch (error) {
    console.error("Failed to generate repayment link:", error);
    return {
      success: false as const,
      error: t("paymentGatewayConnectionFailed"),
    };
  }
};
