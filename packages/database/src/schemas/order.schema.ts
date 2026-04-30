import { numeric, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { baseEntity } from "./helpers.schema";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const orders = pgTable("order", {
  ...baseEntity,
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  status: orderStatusEnum().notNull().default("pending"),
  shippingFee: numeric({ precision: 15, scale: 2 }).notNull(),
  shippingAddress: text().notNull(),
  totalAmount: numeric({ precision: 15, scale: 2 }).notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
