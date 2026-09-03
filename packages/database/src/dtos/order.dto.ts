import type {
  Order,
  OrderItem,
  Payment,
} from "../schemas";

export type CreateOrderDTO = Pick<
  Order,
  "userId" | "shippingAddress" | "shippingFee" | "totalAmount" | "paymentMethod"
> &
  Partial<Pick<Order, "paymentStatus" | "status" | "approvalStatus">> & {
    orderCode?: string;
  };

export type CreateOrderItemDTO = Pick<
  OrderItem,
  "productId" | "productName" | "productSku" | "quantity" | "unitPrice"
>;

export type CreatePaymentDTO = Pick<Payment, "orderId" | "amount" | "method"> &
  Partial<Pick<Payment, "status" | "rawPayload">>;
