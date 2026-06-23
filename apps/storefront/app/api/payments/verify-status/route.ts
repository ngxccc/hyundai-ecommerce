import { NextResponse, connection } from "next/server";
import { getCachedSession } from "@/shared/lib/session";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import { orderService, paymentService } from "@nhatnang/database/services";
export async function GET(request: Request) {
  await connection();
  try {
    const session = await getCachedSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "errors.unauthorized" },
        { status: HTTP_STATUS.UNAUTHORIZED },
      );
    }

    // Rate limiting: max 10 status checks per 30 seconds per user
    const rateLimitResult = await checkRateLimitWithQueue(
      `ratelimit:verify-status:${session.user.id}`,
      10,
      "30 s",
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "errors.rateLimitExceeded" },
        { status: HTTP_STATUS.TOO_MANY_REQUESTS },
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "errors.missingRequiredFields" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    // 1. Fetch order details from database using lightweight status query
    const order = await orderService.getOrderStatus(orderId, session.user.id);
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

    // 3. Fetch latest payment transaction to detect cancellation
    const lastTx = await paymentService.getLastPayOSTransactionByOrderId(orderId);

    return NextResponse.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        status: order.status,
        transactionStatus: lastTx?.status ?? null,
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
    console.error("[verify-status error]", error);
    return NextResponse.json(
      { success: false, error: "errors.internalServerError" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
