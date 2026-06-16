import type { TOrder, TPayment } from "../schemas";

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
