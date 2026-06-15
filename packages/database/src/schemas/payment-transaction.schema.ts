import { numeric, pgEnum, snakeCase, text, uuid } from "drizzle-orm/pg-core";
import { orders, paymentMethodEnum } from "./order.schema";
import { users } from "./auth.schema";
import { fullEntity } from "./helpers.schema";

export const paymentTransactionTypeEnum = pgEnum("payment_transaction_type", [
  "DEPOSIT",
  "REMAINDER",
  "FULL",
]);

export const paymentTransactionStatusEnum = pgEnum(
  "payment_transaction_status",
  ["PENDING", "SUCCESS", "FAILED"],
);

export const paymentTransactions = snakeCase.table("payment_transaction", {
  ...fullEntity,
  orderId: uuid()
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric({ precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum().notNull(),
  transactionType: paymentTransactionTypeEnum().notNull(),
  status: paymentTransactionStatusEnum().notNull().default("PENDING"),
  referenceCode: text().unique().notNull(), // Transaction ID from PayOS/Bank matching to enforce idempotency
  verifiedBy: uuid().references(() => users.id, { onDelete: "set null" }),
});

export type TPaymentTransaction = typeof paymentTransactions.$inferSelect;
export type TNewPaymentTransaction = typeof paymentTransactions.$inferInsert;
