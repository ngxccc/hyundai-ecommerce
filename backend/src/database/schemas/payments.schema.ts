import {
  bigint,
  index,
  numeric,
  snakeCase,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { fullEntity } from "./helpers.schema";
import { users } from "./auth.schema";
import { orders } from "./order.schema";
import {
  debtRepaymentStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
  paymentTransactionStatusEnum,
  paymentTransactionTypeEnum,
} from "./enums.schema";

export const payments = snakeCase.table(
  "payment",
  {
    ...fullEntity,
    orderId: uuid()
      .references(() => orders.id, { onDelete: "restrict" })
      .notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    method: paymentMethodEnum().notNull(),
    status: paymentStatusEnum().default("PENDING").notNull(),
    rawPayload: text(),
  },
  (table) => [
    index("payment_order_idx").on(table.orderId),
    index("payment_status_idx").on(table.status),
  ],
);

export const debtRepayments = snakeCase.table(
  "debt_repayment",
  {
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
  },
  (table) => [
    index("debt_repayment_user_idx").on(table.userId),
    index("debt_repayment_status_idx").on(table.status),
  ],
);

export const paymentTransactions = snakeCase.table(
  "payment_transaction",
  {
    ...fullEntity,
    orderId: uuid()
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum().notNull(),
    transactionType: paymentTransactionTypeEnum().notNull(),
    status: paymentTransactionStatusEnum().notNull().default("PENDING"),
    orderCode: bigint({ mode: "number" }).unique(),
    referenceCode: text().unique(),
    verifiedBy: uuid().references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [
    index("payment_transaction_order_idx").on(table.orderId),
    uniqueIndex("payment_transaction_order_code_uidx").on(table.orderCode),
  ],
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type DebtRepayment = typeof debtRepayments.$inferSelect;
export type NewDebtRepayment = typeof debtRepayments.$inferInsert;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof paymentTransactions.$inferInsert;
