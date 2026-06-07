import {
  index,
  numeric,
  pgEnum,
  snakeCase,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { baseEntity } from "./helpers.schema";
import { sql } from "drizzle-orm";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const orders = snakeCase.table(
  "order",
  {
    ...baseEntity,
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: orderStatusEnum().notNull().default("pending"),
    shippingFee: numeric({ precision: 15, scale: 2 }).notNull(),
    shippingAddress: text().notNull(),
    totalAmount: numeric({ precision: 15, scale: 2 }).notNull(),
  },
  (table) => [
    index("order_user_status_created_idx").on(
      table.userId,
      table.status,
      table.createdAt,
    ),
    index("order_active_metrics_idx")
      .on(table.createdAt)
      .where(sql`${table.status} != 'cancelled'`),
  ],
);

export type TOrder = typeof orders.$inferSelect;
export type TNewOrder = typeof orders.$inferInsert;
