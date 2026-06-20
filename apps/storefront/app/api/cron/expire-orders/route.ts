import { NextResponse, connection } from "next/server";
import { orderService } from "@nhatnang/database/services";
import { env } from "@/env";
import { HTTP_STATUS } from "@nhatnang/shared/constants";

export async function POST(request: Request) {
  await connection();
  try {
    // 1. Authenticate with CRON_SECRET token
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: HTTP_STATUS.UNAUTHORIZED },
      );
    }

    // 2. Trigger expiration logic
    const { expiredCount } = await orderService.expirePendingOrders(15);

    return NextResponse.json({
      success: true,
      message: `Expired ${expiredCount} pending orders.`,
      expiredCount,
    });
  } catch (error) {
    // Re-throw Next.js prerender error
    const errObj = error as Record<string, unknown>;
    if (
      error instanceof Error &&
      (errObj["digest"] === "NEXT_PRERENDER_INTERRUPTED" ||
        error.message.includes("bail out of prerendering"))
    ) {
      throw error;
    }

    console.error("[cron:expire-orders error]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
