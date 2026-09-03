import { HTTP_STATUS } from "@nhatnang/shared/constants";
import {
  checkRateLimitWithQueue,
  jsonSuccess,
  jsonError,
} from "@nhatnang/shared";
import { getCachedSession } from "@/shared/lib/session";
import { connection } from "next/server";
import { checkoutRequestSchema } from "@/features/checkout/validators/checkout.validator";
import { processCheckout } from "@/features/checkout/services/checkout.service";

export async function POST(request: Request) {
  await connection();
  try {
    const session = await getCachedSession();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
    const rateLimitKey = session?.user
      ? `ratelimit:checkout:${session.user.id}`
      : `ratelimit:checkout:${ip}`;

    const rateLimitResult = await checkRateLimitWithQueue(
      rateLimitKey,
      5,
      "60 s",
    );

    if (!rateLimitResult.success) {
      return jsonError({
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        detail: "errors.rateLimitExceeded",
        instance: "/api/checkout",
      });
    }

    if (!session?.user) {
      return jsonError({
        status: HTTP_STATUS.UNAUTHORIZED,
        detail: "errors.unauthorized",
        instance: "/api/checkout",
      });
    }

    const rawBody: unknown = await request.json().catch(() => null);
    const parsed = checkoutRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const detail =
        firstIssue?.path[0] === "paymentMethod"
          ? "errors.invalidPaymentMethod"
          : firstIssue?.path[0] === "paymentOption"
            ? "errors.invalidPaymentOption"
            : "errors.missingRequiredFields";
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail,
        instance: "/api/checkout",
      });
    }

    const result = await processCheckout(session.user.id, parsed.data);

    if (!result.ok) {
      return jsonError({
        status: result.status,
        detail: result.errorKey,
        instance: "/api/checkout",
      });
    }

    return jsonSuccess({
      orderId: result.orderId,
      checkoutUrl: result.checkoutUrl,
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
    console.error("Checkout error:", error);
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: "errors.internalServerError",
      instance: "/api/checkout",
    });
  }
}
