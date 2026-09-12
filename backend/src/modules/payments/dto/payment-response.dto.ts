import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";
import {
  DEBT_REPAYMENT_STATUSES,
  ORDER_PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_TRANSACTION_STATUSES,
  PAYMENT_TRANSACTION_TYPES,
  type DebtRepaymentStatus,
  type OrderPaymentStatus,
  type PaymentMethod,
  type PaymentTransactionStatus,
  type PaymentTransactionType,
} from "@/database/schemas/enums.schema";

export const checkoutLinkResponseSchema = z.object({
  checkoutUrl: z.string(),
  qrCode: z.string(),
  orderCode: z.number(),
  amount: z.number(),
  paymentLinkId: z.string(),
});

export const paymentTransactionResponseSchema = z.object({
  id: z.uuid(),
  orderId: z.uuid(),
  amount: z.string(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  transactionType: z.enum(PAYMENT_TRANSACTION_TYPES),
  status: z.enum(PAYMENT_TRANSACTION_STATUSES),
  orderCode: z.number().nullable().optional(),
  referenceCode: z.string().nullable().optional(),
  verifiedBy: z.uuid().nullable().optional(),
  createdAt: zDate(),
  updatedAt: zDate(),
});

export const debtRepaymentResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  amount: z.string(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  status: z.enum(DEBT_REPAYMENT_STATUSES),
  orderCode: z.number().nullable().optional(),
  referenceCode: z.string().nullable().optional(),
  verifiedBy: z.uuid().nullable().optional(),
  checkoutUrl: z.string().nullable().optional(),
  qrCode: z.string().nullable().optional(),
  createdAt: zDate(),
  updatedAt: zDate(),
});

export const orderPaymentSummarySchema = z.object({
  orderId: z.uuid(),
  orderNumber: z.string().nullable().optional(),
  totalAmount: z.string(),
  depositAmount: z.string().nullable().optional(),
  remainingAmount: z.string().nullable().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentStatus: z.enum(ORDER_PAYMENT_STATUSES),
  transactions: z.array(paymentTransactionResponseSchema),
});

export type {
  DebtRepaymentStatus,
  OrderPaymentStatus,
  PaymentMethod,
  PaymentTransactionStatus,
  PaymentTransactionType,
};

export class CheckoutLinkResponseDto extends createZodDto(
  checkoutLinkResponseSchema,
) {}
export class PaymentTransactionResponseDto extends createZodDto(
  paymentTransactionResponseSchema,
) {}
export class DebtRepaymentResponseDto extends createZodDto(
  debtRepaymentResponseSchema,
) {}
export class OrderPaymentSummaryDto extends createZodDto(
  orderPaymentSummarySchema,
) {}
