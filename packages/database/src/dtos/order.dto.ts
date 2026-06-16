import type {
  TOrder,
  TPayment,
  orderPaymentStatusEnum,
  paymentMethodEnum,
  paymentTransactionTypeEnum,
} from "../schemas";

export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type PaymentTransactionType =
  (typeof paymentTransactionTypeEnum.enumValues)[number];
export type OrderPaymentStatus =
  (typeof orderPaymentStatusEnum.enumValues)[number];

export interface CheckoutRequestBody {
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  paymentOption: PaymentTransactionType;
  shippingFee?: number;
}

export interface CreateOrderDTO {
  userId: string;
  shippingAddress: string;
  shippingFee: string;
  totalAmount: string;
  paymentMethod: TOrder["paymentMethod"];
  paymentStatus?: TOrder["paymentStatus"];
  status?: TOrder["status"];
  approvalStatus?: TOrder["approvalStatus"];
  orderCode?: string;
}

export interface CreateOrderItemDTO {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: string;
}

export interface CreatePaymentDTO {
  orderId: string;
  amount: string;
  method: TPayment["method"];
  status?: TPayment["status"];
  transactionId?: string;
  rawPayload?: string;
}
