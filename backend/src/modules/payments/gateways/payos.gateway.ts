import { Injectable, Logger } from "@nestjs/common";
import { env } from "@/env";
import { generatePayOSSignature } from "../payos.util";
import { PAYOS_ENDPOINTS } from "../constants/payment.constant";
import type {
  PaymentGateway,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResult,
} from "../interfaces/payment-gateway.interface";

@Injectable()
export class PayOSGateway implements PaymentGateway {
  private readonly logger = new Logger(PayOSGateway.name);

  async createPaymentLink(
    request: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResult> {
    const payloadToSign = {
      amount: request.amount,
      cancelUrl: request.cancelUrl,
      description: request.description,
      orderCode: request.orderCode,
      returnUrl: request.returnUrl,
    };

    const signature = generatePayOSSignature(
      payloadToSign,
      env.PAYOS_CHECKSUM_KEY,
    );

    const response = await fetch(PAYOS_ENDPOINTS.PAYMENT_REQUESTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": env.PAYOS_CLIENT_ID,
        "x-api-key": env.PAYOS_API_KEY,
      },
      body: JSON.stringify({
        ...payloadToSign,
        signature,
      }),
    });

    const resData = (await response.json()) as {
      code: string;
      desc?: string;
      data?: {
        checkoutUrl?: string;
        qrCode?: string;
        paymentLinkId?: string;
      };
    };

    if (resData.code !== "00" || !resData.data?.checkoutUrl) {
      const errorMsg =
        resData.desc ?? `PayOS API returned code ${resData.code}`;
      this.logger.error(`PayOS Payment Creation Failed: ${errorMsg}`);
      throw new Error(`PayOS Gateway Error: ${errorMsg}`);
    }

    return {
      checkoutUrl: resData.data.checkoutUrl,
      qrCode:
        resData.data.qrCode ??
        `00020101021238540010A00000072701260006970422${request.orderCode.toString()}`,
      paymentLinkId:
        resData.data.paymentLinkId ?? `plink_${request.orderCode.toString()}`,
    };
  }
}
