import { NextResponse, connection } from "next/server";
import { getCachedSession } from "@/shared/lib/session";
import { headers } from "next/headers";
import { HTTP_STATUS, FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
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
      return NextResponse.json(
        { success: false, error: "errors.rateLimitExceeded" },
        { status: HTTP_STATUS.TOO_MANY_REQUESTS },
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "errors.unauthorized" },
        { status: HTTP_STATUS.UNAUTHORIZED },
      );
    }

    const body = (await request.json()) as GenerateDepositLinkRequestBody;
    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, error: "errors.missingRequiredFields" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    // 1. Fetch order details from database
    const order = await orderQueryService.getComplexOrder(orderId, session.user.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "errors.orderNotFound" },
        { status: HTTP_STATUS.NOT_FOUND },
      );
    }

    // 2. IDOR Guard: verify ownership
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "errors.forbidden" },
        { status: HTTP_STATUS.FORBIDDEN },
      );
    }

    // 3. Status guards: order must be UNPAID and method must be CASH
    if (order.paymentStatus !== "UNPAID") {
      return NextResponse.json(
        { success: false, error: "errors.invalidPaymentStatus" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    if (order.paymentMethod !== "CASH") {
      return NextResponse.json(
        { success: false, error: "errors.invalidPaymentMethod" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
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
          return NextResponse.json(
            { success: false, error: "errors.payosLinkCreationFailed" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
          );
        }
      } catch (error) {
        console.error("Failed to connect to PayOS:", error);
        return NextResponse.json(
          { success: false, error: "errors.paymentGatewayConnectionFailed" },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
        );
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

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl,
      },
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
    return NextResponse.json(
      { success: false, error: "errors.internalServerError" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
