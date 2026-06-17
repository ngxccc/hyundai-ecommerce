import { bigint, numeric, pgEnum, snakeCase, text, uuid } from "drizzle-orm/pg-core";
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

export type TPayment = typeof payments.$inferSelect;
export type TNewPayment = typeof payments.$inferInsert;
export type TDebtRepayment = typeof debtRepayments.$inferSelect;
export type TNewDebtRepayment = typeof debtRepayments.$inferInsert;
