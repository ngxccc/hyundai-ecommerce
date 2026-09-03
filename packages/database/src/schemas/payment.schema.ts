import {
  bigint,
  numeric,
  pgEnum,
  snakeCase,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import {
  PAYMENT_TRANSACTION_TYPES,
  PAYMENT_TRANSACTION_STATUSES,
  type PaymentTransactionType,
  type PaymentTransactionStatus,
} from "@nhatnang/core";
import { orders, paymentMethodEnum } from "./order.schema";
import { users } from "./auth.schema";
import { fullEntity } from "./helpers.schema";
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export const debtRepaymentStatusEnum = pgEnum("debt_repayment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
]);

export const paymentTransactionTypeEnum = pgEnum(
  "payment_transaction_type",
  PAYMENT_TRANSACTION_TYPES,
);

export const paymentTransactionStatusEnum = pgEnum(
  "payment_transaction_status",
  PAYMENT_TRANSACTION_STATUSES,
);
export const payments = snakeCase.table("payment", {
  ...fullEntity,
  orderId: uuid()
    .references(() => orders.id, { onDelete: "restrict" })
    .notNull(),
  amount: numeric({ precision: 15, scale: 2 }).notNull(),
  method: paymentMethodEnum().notNull(),
  status: paymentStatusEnum().default("PENDING").notNull(),
  rawPayload: text(),
});

export const debtRepayments = snakeCase.table("debt_repayment", {
  ...fullEntity,
  userId: uuid()
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  amount: numeric({ precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum().notNull(),
  status: debtRepaymentStatusEnum().default("PENDING").notNull(),
  orderCode: bigint({ mode: "number" }).unique(),
  referenceCode: text().unique(),
  verifiedBy: uuid().references(() => users.id, { onDelete: "set null" }),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type DebtRepayment = typeof debtRepayments.$inferSelect;
export type NewDebtRepayment = typeof debtRepayments.$inferInsert;

export const paymentTransactions = snakeCase.table("payment_transaction", {
  ...fullEntity,
  orderId: uuid()
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric({ precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum().notNull(),
  transactionType: paymentTransactionTypeEnum().notNull(),
  status: paymentTransactionStatusEnum().notNull().default("PENDING"),
  orderCode: bigint({ mode: "number" }).unique(),
  referenceCode: text().unique(), // Transaction ID from PayOS/Bank matching to enforce idempotency (populated on success)
  verifiedBy: uuid().references(() => users.id, { onDelete: "set null" }),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof paymentTransactions.$inferInsert;

export type { PaymentTransactionType, PaymentTransactionStatus };
