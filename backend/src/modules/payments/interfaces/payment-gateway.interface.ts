export interface CreatePaymentLinkRequest {
  orderCode: number;
  amount: number;
  description: string;
  cancelUrl: string;
  returnUrl: string;
}

export interface CreatePaymentLinkResult {
  checkoutUrl: string;
  qrCode: string;
  paymentLinkId: string;
}

export interface PaymentGateway {
  createPaymentLink(
    request: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResult>;
}

export const PAYMENT_GATEWAY_TOKEN = Symbol("PAYMENT_GATEWAY_TOKEN");
