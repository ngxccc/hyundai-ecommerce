export const PAYMENT_TRANSACTION_TYPES = [
  "DEPOSIT",
  "REMAINDER",
  "FULL",
] as const;

export type PaymentTransactionType =
  (typeof PAYMENT_TRANSACTION_TYPES)[number];

export const PAYMENT_TRANSACTION_STATUSES = [
  "PENDING",
  "SUCCESS",
  "FAILED",
] as const;

export type PaymentTransactionStatus =
  (typeof PAYMENT_TRANSACTION_STATUSES)[number];
