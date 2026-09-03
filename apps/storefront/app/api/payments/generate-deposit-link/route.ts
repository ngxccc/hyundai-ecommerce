import { connection } from "next/server";
import { getCachedSession } from "@/shared/lib/session";
import { headers } from "next/headers";
import { HTTP_STATUS, FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import {
  checkRateLimitWithQueue,
  jsonSuccess,
  jsonError,
} from "@nhatnang/shared";
import { env } from "@/env";
import {
  createPayOSPaymentLink,
  generatePayOSOrderCode,
  PAYOS_SUCCESS_CODE,
  makePayOSDescription,
} from "@nhatnang/shared/lib/payos";
import { orderService, orderQueryService } from "@nhatnang/database/services";

interface GenerateDepositLinkRequestBody {
  orderId: string;
}

export async function POST(request: Request) {
  await connection();
  try {
    const session = await getCachedSession();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
    const rateLimitKey = session?.user
      ? `ratelimit:generate-deposit-link:${session.user.id}`
      : `ratelimit:generate-deposit-link:${ip}`;

    const rateLimitResult = await checkRateLimitWithQueue(
      rateLimitKey,
      5,
      "60 s",
    );

    if (!rateLimitResult.success) {
      return jsonError({
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        detail: "errors.rateLimitExceeded",
        instance: "/api/payments/generate-deposit-link",
      });
    }

    if (!session?.user) {
      return jsonError({
        status: HTTP_STATUS.UNAUTHORIZED,
        detail: "errors.unauthorized",
        instance: "/api/payments/generate-deposit-link",
      });
    }

    const body = (await request.json()) as GenerateDepositLinkRequestBody;
    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail: "errors.missingRequiredFields",
        instance: "/api/payments/generate-deposit-link",
      });
    }

    // 1. Fetch order details from database
    const order = await orderQueryService.getComplexOrder(
      orderId,
      session.user.id,
    );
    if (!order) {
      return jsonError({
        status: HTTP_STATUS.NOT_FOUND,
        detail: "errors.orderNotFound",
        instance: "/api/payments/generate-deposit-link",
      });
    }

    // 2. IDOR Guard: verify ownership
    if (order.userId !== session.user.id) {
      return jsonError({
        status: HTTP_STATUS.FORBIDDEN,
        detail: "errors.forbidden",
        instance: "/api/payments/generate-deposit-link",
      });
    }

    // 3. Status guards: order must be UNPAID and method must be CASH
    if (order.paymentStatus !== "UNPAID") {
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail: "errors.invalidPaymentStatus",
        instance: "/api/payments/generate-deposit-link",
      });
    }

    if (order.paymentMethod !== "CASH") {
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail: "errors.invalidPaymentMethod",
        instance: "/api/payments/generate-deposit-link",
      });
    }

    // 4. Calculate 20% deposit amount
    const totalAmountNum = parseFloat(order.totalAmount);
    const depositAmount = Math.round(
      totalAmountNum * FINANCIAL_CONSTANTS.DEPOSIT_RATE,
    );

    const reqHeaders = await headers();
    // 5. Generate PayOS Payment Link
    const orderCode = generatePayOSOrderCode();

    const isMockPayment =
      env.FORCE_MOCK_PAYMENT === "true" ||
      (env.FORCE_MOCK_PAYMENT !== "false" &&
        process.env.NODE_ENV !== "production");

    const checkoutUrl = isMockPayment
      ? `${env.NEXT_PUBLIC_APP_URL}/checkout/mock-payment?orderCode=${orderCode}`
      : `${env.NEXT_PUBLIC_APP_URL}/checkout/pay?orderId=${order.id}`;
    if (
      !isMockPayment &&
      env.PAYOS_CLIENT_ID !== "mock_client_id" &&
      env.PAYOS_API_KEY !== "mock_api_key" &&
      !env.PAYOS_CLIENT_ID.startsWith("mock")
    ) {
      try {
        const result = await createPayOSPaymentLink({
          orderCode,
          amount: depositAmount,
          description: makePayOSDescription("deposit", orderCode),
          cancelUrl: `${reqHeaders.get("origin") ?? env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
          returnUrl: `${reqHeaders.get("origin") ?? env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
        });

        if (result?.code === PAYOS_SUCCESS_CODE) {
          // Registered successfully, but keep checkoutUrl pointing to our success/mock page
        } else {
          console.error("PayOS API error:", result);
          return jsonError({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            detail: "errors.payosLinkCreationFailed",
            instance: "/api/payments/generate-deposit-link",
          });
        }
      } catch (error) {
        console.error("Failed to connect to PayOS:", error);
        return jsonError({
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          detail: "errors.paymentGatewayConnectionFailed",
          instance: "/api/payments/generate-deposit-link",
        });
      }
    }

    // 6. Create a pending payment transaction row via the order service helper
    await orderService.createPendingPaymentTransaction(
      order.id,
      depositAmount,
      "DEPOSIT",
      orderCode,
      "PAYOS",
    );

    return jsonSuccess({
      checkoutUrl,
    });
  } catch (error) {
    const errObj = error as Record<string, unknown>;
    if (
      error instanceof Error &&
      (errObj["digest"] === "NEXT_PRERENDER_INTERRUPTED" ||
        error.message.includes("bail out of prerendering"))
    ) {
      throw error;
    }
    console.error("[generate-deposit-link error]", error);
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: "errors.internalServerError",
      instance: "/api/payments/generate-deposit-link",
    });
  }
}
