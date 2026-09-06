import { Injectable, Logger } from "@nestjs/common";
import {
  buildPayOSCheckoutUrl,
  buildSimulatedVietQR,
} from "../constants/payment.constant";
import type {
  PaymentGateway,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResult,
} from "../interfaces/payment-gateway.interface";

@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  private readonly logger = new Logger(MockPaymentGateway.name);

  createPaymentLink(
    request: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResult> {
    this.logger.debug(
      `[MockPaymentGateway] Generating simulated payment link for orderCode: ${String(request.orderCode)} (Amount: ${String(request.amount)})`,
    );

    return Promise.resolve({
      checkoutUrl: buildPayOSCheckoutUrl(request.orderCode),
      qrCode: buildSimulatedVietQR(request.orderCode),
      paymentLinkId: `plink_${request.orderCode.toString()}`,
    });
  }
}
