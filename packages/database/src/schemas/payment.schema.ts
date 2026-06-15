import { numeric, pgEnum, snakeCase, text, uuid } from "drizzle-orm/pg-core";
import { orders, paymentMethodEnum } from "./order.schema";
import { fullEntity } from "./helpers.schema";

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export const payments = snakeCase.table("payment", {
  ...fullEntity,
  orderId: uuid()
    .references(() => orders.id, { onDelete: "restrict" })
    .notNull(),
  amount: numeric({ precision: 15, scale: 2 }).notNull(),
  method: paymentMethodEnum().notNull(),
  status: paymentStatusEnum().default("PENDING").notNull(),
  transactionId: text(),
  rawPayload: text(),
});

export type TPayment = typeof payments.$inferSelect;
export type TNewPayment = typeof payments.$inferInsert;
