import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { paymentService } from "@nhatnang/database/services";
import { env } from "@/env";
import {
  verifyPayOSSignature,
  type PayOSWebhookBody,
  PAYOS_SUCCESS_CODE,
} from "@nhatnang/shared";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, data, signature } =
      (await request.json()) as PayOSWebhookBody;

    // 1. Prevent payment spoofing by verifying signature
    if (!data || !signature) {
      return NextResponse.json(
        { success: false, error: "errors.missingRequiredFields" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    const isValid = verifyPayOSSignature(
      data,
      signature,
      env.PAYOS_CHECKSUM_KEY,
    );
    if (!isValid) {
      console.warn("[PayOS Webhook] Invalid webhook signature detected");
      return NextResponse.json(
        { success: false, error: "errors.invalidSignature" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    // 2. Process payment state atomically in database
    if (code === PAYOS_SUCCESS_CODE) {
      let updated = await paymentService.confirmPayOSPayment(
        String(data.orderCode),
        data.amount,
        data.reference,
      );

      if (!updated) {
        // Fallback: check if it matches a B2B debt repayment
        updated = await paymentService.confirmDebtRepayment(
          String(data.orderCode),
          data.amount,
          data.reference,
        );
      }

      if (!updated) {
        console.warn(
          `[PayOS Webhook] Order code ${data.orderCode} already processed or not found in order payments or debt repayments`,
        );
      }
    }

    // 3. Acknowledge receipt to PayOS
    return NextResponse.json(
      { success: true, message: "Webhook processed successfully" },
      { status: HTTP_STATUS.OK },
    );
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
    return NextResponse.json(
      { success: false, error: "errors.internalServerError" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
