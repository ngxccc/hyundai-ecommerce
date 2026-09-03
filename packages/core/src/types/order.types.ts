export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "REFUND_PENDING",
  "SUSPICIOUS_PAYMENT_HOLD",
  "CANCELLATION_REQUESTED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = [
  "TRADE_CREDIT",
  "PAYOS",
  "CASH",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_PAYMENT_STATUSES = [
  "UNPAID",
  "DEPOSIT_PAID",
  "FULLY_PAID",
  "PENDING_VERIFICATION",
] as const;

export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUSES)[number];

export const APPROVAL_STATUSES = [
  "APPROVED",
  "PENDING_APPROVAL",
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
