import { pgEnum } from "drizzle-orm/pg-core";

// 1. User & Authentication Enums
export const USER_ROLES = [
  "CUSTOMER",
  "DEALER_APPROVER",
  "DEALER_PURCHASER",
  "ADMIN",
] as const;
export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const USER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
] as const;
export const userStatusEnum = pgEnum("user_status", USER_STATUSES);
export type UserStatus = (typeof userStatusEnum.enumValues)[number];

export const BUSINESS_TYPES = [
  "CONTRACTOR",
  "COMMERCIAL",
  "GOVERNMENT",
  "END_USER",
  "DEALER",
] as const;
export const businessTypeEnum = pgEnum("business_type", BUSINESS_TYPES);
export type BusinessType = (typeof businessTypeEnum.enumValues)[number];

// 2. Order & Checkout Enums
export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export const orderStatusEnum = pgEnum("order_status", ORDER_STATUSES);
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export const PAYMENT_METHODS = [
  "CASH",
  "TRADE_CREDIT",
  "PAYOS",
  "BANK_TRANSFER",
] as const;
export const paymentMethodEnum = pgEnum("payment_method", PAYMENT_METHODS);
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];

export const ORDER_PAYMENT_STATUSES = [
  "PENDING",
  "DEPOSIT_PAID",
  "FULLY_PAID",
  "REFUNDED",
  "FAILED",
] as const;
export const orderPaymentStatusEnum = pgEnum(
  "order_payment_status",
  ORDER_PAYMENT_STATUSES,
);
export type OrderPaymentStatus =
  (typeof orderPaymentStatusEnum.enumValues)[number];

export const APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const approvalStatusEnum = pgEnum("approval_status", APPROVAL_STATUSES);
export type ApprovalStatus = (typeof approvalStatusEnum.enumValues)[number];

// 3. Quote Negotiation Enums
export const QUOTE_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "NEGOTIATING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
] as const;
export const quoteStatusEnum = pgEnum("quote_status", QUOTE_STATUSES);
export type QuoteStatus = (typeof quoteStatusEnum.enumValues)[number];

// 4. Payment Processing Enums
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

export const debtRepaymentStatusEnum = pgEnum("debt_repayment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
]);
export type DebtRepaymentStatus =
  (typeof debtRepaymentStatusEnum.enumValues)[number];

export const PAYMENT_TRANSACTION_TYPES = [
  "FULL_PAYMENT",
  "DEPOSIT",
  "REMAINING",
  "DEBT_REPAYMENT",
] as const;
export const paymentTransactionTypeEnum = pgEnum(
  "payment_transaction_type",
  PAYMENT_TRANSACTION_TYPES,
);
export type PaymentTransactionType =
  (typeof paymentTransactionTypeEnum.enumValues)[number];

export const PAYMENT_TRANSACTION_STATUSES = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;
export const paymentTransactionStatusEnum = pgEnum(
  "payment_transaction_status",
  PAYMENT_TRANSACTION_STATUSES,
);
export type PaymentTransactionStatus =
  (typeof paymentTransactionStatusEnum.enumValues)[number];

// 5. Outbox Event Enums
export const eventTypeEnum = pgEnum("event_type", [
  "SEND_QUOTE_EMAIL",
  "SEND_MAIL",
  "SEND_ZALO_ZNS",
  "ORDER_CREATED",
  "PAYMENT_RECEIVED",
  "DEALER_APPROVAL_REQUIRED",
]);
export type EventType = (typeof eventTypeEnum.enumValues)[number];

export const outboxEventStatusEnum = pgEnum("outbox_event_status", [
  "PENDING",
  "PROCESSING",
  "PROCESSED",
  "FAILED",
]);
export type OutboxEventStatus =
  (typeof outboxEventStatusEnum.enumValues)[number];
