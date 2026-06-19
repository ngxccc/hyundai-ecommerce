import { NextResponse } from "next/server";
import { getCachedSession } from "@/shared/lib/session";
import { headers } from "next/headers";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import { paymentService, userService } from "@nhatnang/database/services";
import { env } from "@/env";
import {
  createPayOSPaymentLink,
  generatePayOSOrderCode,
  PAYOS_SUCCESS_CODE,
} from "@nhatnang/shared/lib/payos";

interface GenerateRepaymentLinkRequestBody {
  amount: number;
}

export async function POST(request: Request) {
  try {
    // 0. Rate limiting (max 5 requests per minute per IP)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
    const rateLimitResult = await checkRateLimitWithQueue(
      `ratelimit:generate-repayment-link:${ip}`,
      5,
      "60 s",
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "errors.rateLimitExceeded" },
        { status: HTTP_STATUS.TOO_MANY_REQUESTS },
      );
    }

    const reqHeaders = await headers();
    const session = await getCachedSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "errors.unauthorized" },
        { status: HTTP_STATUS.UNAUTHORIZED },
      );
    }

    const body = (await request.json()) as GenerateRepaymentLinkRequestBody;
    const { amount } = body;

    if (amount === undefined || amount === null || typeof amount !== "number") {
      return NextResponse.json(
        { success: false, error: "errors.missingRequiredFields" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    const parsedAmount = parseFloat(String(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "errors.invalidAmount" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    // Get B2B profile to verify roles and currentDebt limit
    const user = await userService.getB2BProfile(session.user.id);
    if (
      !user ||
      (user.role !== "SUPER_ADMIN" &&
        user.role !== "DEALER_APPROVER" &&
        user.role !== "DEALER_PURCHASER")
    ) {
      return NextResponse.json(
        { success: false, error: "errors.unauthorized" },
        { status: HTTP_STATUS.UNAUTHORIZED },
      );
    }

    const currentDebt = parseFloat(user.currentDebt || "0");
    if (parsedAmount > currentDebt) {
      return NextResponse.json(
        { success: false, error: "errors.invalidAmount" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    const orderCode = generatePayOSOrderCode();
    let checkoutUrl = `${env.NEXT_PUBLIC_APP_URL}/checkout/mock-payment?orderCode=${orderCode}`;

    if (
      env.PAYOS_CLIENT_ID !== "mock_client_id" &&
      env.PAYOS_API_KEY !== "mock_api_key" &&
      !env.PAYOS_CLIENT_ID.startsWith("mock")
    ) {
      try {
        const result = await createPayOSPaymentLink({
          orderCode,
          amount: Math.round(parsedAmount),
          description: `Tra no CN ${orderCode}`.slice(0, 25),
          cancelUrl: `${reqHeaders.get("origin") ?? env.NEXT_PUBLIC_APP_URL}/portal/debt?repaymentCancel=true`,
          returnUrl: `${reqHeaders.get("origin") ?? env.NEXT_PUBLIC_APP_URL}/portal/debt?repaymentSuccess=true`,
        });

        if (result?.code === PAYOS_SUCCESS_CODE && result.data?.checkoutUrl) {
          checkoutUrl = result.data.checkoutUrl;
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

    // Create a pending debt repayment record
    await paymentService.createDebtRepayment({
      userId: session.user.id,
      amount: parsedAmount.toFixed(2),
      paymentMethod: "PAYOS",
      status: "PENDING",
      orderCode,
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl,
      },
    });
  } catch (error) {
    console.error("[generate-repayment-link error]", error);
    return NextResponse.json(
      { success: false, error: "errors.internalServerError" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
