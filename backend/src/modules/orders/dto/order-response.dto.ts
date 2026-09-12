import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";
import {
  APPROVAL_STATUSES,
  ORDER_PAYMENT_STATUSES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  type ApprovalStatus,
  type OrderPaymentStatus,
  type OrderStatus,
  type PaymentMethod,
} from "@/database/schemas/enums.schema";

export const orderItemProductSummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  nameVi: z.string().optional(),
  nameEn: z.string().nullable().optional(),
  slug: z.string(),
  price: z.string(),
  images: z.array(z.string()),
  totalStockCache: z.number().int(),
});

export const orderItemResponseSchema = z.object({
  id: z.uuid(),
  orderId: z.uuid(),
  productId: z.uuid(),
  productName: z.string(),
  productSku: z.string(),
  quantity: z.number().int(),
  unitPrice: z.string(),
  product: orderItemProductSummarySchema.nullable().optional(),
  createdAt: zDate(),
  updatedAt: zDate(),
});

export const orderUserSummarySchema = z.object({
  id: z.uuid(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  role: z.string(),
});

export const orderResponseSchema = z.object({
  id: z.uuid(),
  orderNumber: z.string().nullable().optional(),
  userId: z.uuid().nullable().optional(),
  leadId: z.uuid().nullable().optional(),
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  customerEmail: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  status: z.enum(ORDER_STATUSES),
  shippingFee: z.string(),
  shippingAddress: z.string(),
  totalAmount: z.string(),
  depositAmount: z.string().nullable().optional(),
  remainingAmount: z.string().nullable().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentStatus: z.enum(ORDER_PAYMENT_STATUSES),
  approvalStatus: z.enum(APPROVAL_STATUSES),
  approvedBy: z.uuid().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: zDate(),
  updatedAt: zDate(),
  items: z.array(orderItemResponseSchema),
  user: orderUserSummarySchema.nullable().optional(),
});

export const paginatedOrderResponseSchema = z.object({
  items: z.array(orderResponseSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const expireOrdersResponseSchema = z.object({
  expiredCount: z.number().int(),
});

export type { ApprovalStatus, OrderPaymentStatus, OrderStatus, PaymentMethod };

export class OrderItemProductSummaryDto extends createZodDto(
  orderItemProductSummarySchema,
) {}
export class OrderItemResponseDto extends createZodDto(
  orderItemResponseSchema,
) {}
export class OrderUserSummaryDto extends createZodDto(orderUserSummarySchema) {}
export class OrderResponseDto extends createZodDto(orderResponseSchema) {}
export class PaginatedOrderResponseDto extends createZodDto(
  paginatedOrderResponseSchema,
) {}
export class ExpireOrdersResponseDto extends createZodDto(
  expireOrdersResponseSchema,
) {}
