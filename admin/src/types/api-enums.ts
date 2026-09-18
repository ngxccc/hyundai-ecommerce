/**
 * AUTO-GENERATED RUNTIME CONSTANTS FROM OPENAPI SPECIFICATION
 * Do not edit directly. Re-run `bun run types:sync` or `bun run types:pull`.
 */

export const USER_ROLES = [
  "ADMIN",
  "SALES",
  "WAREHOUSE",
  "ACCOUNTANT",
  "CUSTOMER",
] as const;
export type UserRolesType = (typeof USER_ROLES)[number];

export const BUSINESS_TYPES = [
  "INTERNAL",
  "DEALER",
  "CONTRACTOR",
  "COMMERCIAL",
  "GOVERNMENT",
  "END_USER",
] as const;
export type BusinessTypesType = (typeof BUSINESS_TYPES)[number];

export const USER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
] as const;
export type UserStatusesType = (typeof USER_STATUSES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatusesType = (typeof ORDER_STATUSES)[number];

export const ORDER_PAYMENT_STATUSES = [
  "PENDING",
  "DEPOSIT_PAID",
  "FULLY_PAID",
  "REFUNDED",
  "FAILED",
] as const;
export type OrderPaymentStatusesType = (typeof ORDER_PAYMENT_STATUSES)[number];

export const ORDER_PAYMENT_METHODS = [
  "CASH",
  "TRADE_CREDIT",
  "PAYOS",
  "BANK_TRANSFER",
] as const;
export type OrderPaymentMethodsType = (typeof ORDER_PAYMENT_METHODS)[number];

export const ORDER_APPROVAL_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;
export type OrderApprovalStatusesType =
  (typeof ORDER_APPROVAL_STATUSES)[number];

export const QUOTE_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "NEGOTIATING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
] as const;
export type QuoteStatusesType = (typeof QUOTE_STATUSES)[number];

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTING",
  "SURVEY_SCHEDULED",
  "QUOTED",
  "CONVERTED",
  "REJECTED",
  "LOST",
] as const;
export type LeadStatusesType = (typeof LEAD_STATUSES)[number];
