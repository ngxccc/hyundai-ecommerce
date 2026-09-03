import crypto from "crypto";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { paymentService } from "@nhatnang/database/services";
import { env } from "@/env";
import {
  generatePayOSSignature,
  type PayOSWebhookBody,
  PAYOS_SUCCESS_CODE,
  jsonSuccess,
  jsonError,
} from "@nhatnang/shared";
export async function POST(request: Request) {
  try {
    const rawBody: unknown = await request.json();
    if (!rawBody || typeof rawBody !== "object") {
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail: "errors.missingRequiredFields",
        instance: "/api/payments/payos-webhook",
      });
    }

    const { code, data, signature } = rawBody as PayOSWebhookBody;
    if (
      !data ||
      typeof data !== "object" ||
      typeof signature !== "string" ||
      !signature
    ) {
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail: "errors.missingRequiredFields",
        instance: "/api/payments/payos-webhook",
      });
    }

    // 1. Prevent payment spoofing via constant-time HMAC verification
    const expectedSignature = generatePayOSSignature(
      data,
      env.PAYOS_CHECKSUM_KEY,
    );
    const signatureBuffer = Buffer.from(signature, "utf-8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      console.warn("[PayOS Webhook] Invalid webhook signature detected");
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail: "errors.invalidSignature",
        instance: "/api/payments/payos-webhook",
      });
    }
    // 2. Process payment state atomically in database
    const isSuccess =
      code === PAYOS_SUCCESS_CODE || data.code === PAYOS_SUCCESS_CODE;

    if (isSuccess) {
      const orderCodeStr = String(data.orderCode ?? "").replace(/[^\w-]/g, "");
      let updated = await paymentService.confirmPayOSPayment(
        orderCodeStr,
        Number(data.amount) || 0,
        String(data.reference ?? ""),
      );

      if (!updated) {
        // Fallback: check if it matches a B2B debt repayment
        updated = await paymentService.confirmDebtRepayment(
          orderCodeStr,
          Number(data.amount) || 0,
          String(data.reference ?? ""),
        );
      }

      if (!updated) {
        console.warn(
          "[PayOS Webhook] Order code already processed or not found in order payments or debt repayments",
          { orderCode: Number(data.orderCode) || 0 },
        );
      }
    }

    // 3. Acknowledge receipt to PayOS
    return jsonSuccess({ message: "Webhook processed successfully" });
  } catch (error) {
    const errObj = error as Record<string, unknown>;
    if (
      error instanceof Error &&
      (errObj["digest"] === "NEXT_PRERENDER_INTERRUPTED" ||
        error.message.includes("bail out of prerendering"))
    ) {
      throw error;
    }
    console.error("[PayOS Webhook] Error processing payment webhook:", error);
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: "errors.internalServerError",
      instance: "/api/payments/payos-webhook",
    });
  }
}
