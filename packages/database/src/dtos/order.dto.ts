import type {
  PaymentMethod,
  PaymentTransactionType,
  TOrder,
  TOrderItem,
  TPayment,
} from "../schemas";

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
