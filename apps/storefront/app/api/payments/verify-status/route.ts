import { connection } from "next/server";
import { getCachedSession } from "@/shared/lib/session";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import {
  checkRateLimitWithQueue,
  jsonSuccess,
  jsonError,
} from "@nhatnang/shared";
import { orderQueryService, paymentService } from "@nhatnang/database/services";
export async function GET(request: Request) {
  await connection();
  try {
    const session = await getCachedSession();
    if (!session?.user) {
      return jsonError({
        status: HTTP_STATUS.UNAUTHORIZED,
        detail: "Unauthorized",
        instance: "/api/payments/verify-status",
      });
    }

    // Rate limiting: max 10 status checks per 30 seconds per user
    const rateLimitResult = await checkRateLimitWithQueue(
      `ratelimit:verify-status:${session.user.id}`,
      10,
      "30 s",
    );

    if (!rateLimitResult.success) {
      return jsonError({
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        detail: "Rate limit exceeded",
        instance: "/api/payments/verify-status",
      });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail: "Missing required field: orderId",
        instance: "/api/payments/verify-status",
      });
    }

    // 1. Fetch order details from database using lightweight status query
    const order = await orderQueryService.getOrderStatus(
      orderId,
      session.user.id,
    );
    if (!order) {
      return jsonError({
        status: HTTP_STATUS.NOT_FOUND,
        detail: "Order not found",
        instance: "/api/payments/verify-status",
      });
    }

    // 2. IDOR Guard: verify ownership
    if (order.userId !== session.user.id) {
      return jsonError({
        status: HTTP_STATUS.FORBIDDEN,
        detail: "Forbidden",
        instance: "/api/payments/verify-status",
      });
    }

    // 3. Fetch latest payment transaction to detect cancellation
    const lastTx =
      await paymentService.getLastPayOSTransactionByOrderId(orderId);

    return jsonSuccess({
      paymentStatus: order.paymentStatus,
      status: order.status,
      transactionStatus: lastTx?.status ?? null,
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
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: "Internal server error",
      instance: "/api/payments/verify-status",
    });
  }
}
