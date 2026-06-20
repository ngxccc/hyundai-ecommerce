import { NextResponse, connection } from "next/server";
import { getCachedSession } from "@/shared/lib/session";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { orderService } from "@nhatnang/database/services";

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

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "errors.missingRequiredFields" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    // 1. Fetch order details from database
    const order = await orderService.getComplexOrder(orderId);

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

    return NextResponse.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
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
