import type {
  TOrder,
  TOrderItem,
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

export type CreateOrderDTO = Pick<
  TOrder,
  "userId" | "shippingAddress" | "shippingFee" | "totalAmount" | "paymentMethod"
> &
  Partial<Pick<TOrder, "paymentStatus" | "status" | "approvalStatus">> & {
    orderCode?: string;
  };

export type CreateOrderItemDTO = Pick<
  TOrderItem,
  "productId" | "productName" | "productSku" | "quantity" | "unitPrice"
>;

export type CreatePaymentDTO = Pick<TPayment, "orderId" | "amount" | "method"> &
  Partial<Pick<TPayment, "status" | "rawPayload">>;
