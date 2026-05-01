import { numeric, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { orders } from "./order.schema";
import { fullEntity } from "./helpers.schema";

export const paymentMethodEnum = pgEnum("payment_method", [
  "COD",
  "MOMO",
  "ZALOPAY",
  "VNPAY",
  "BANK_TRANSFER",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export const payments = pgTable("payment", {
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

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
