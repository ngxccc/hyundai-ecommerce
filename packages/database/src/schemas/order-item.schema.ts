import { integer, numeric, snakeCase, text, uuid } from "drizzle-orm/pg-core";
import { orders } from "./order.schema";
import { products } from "./product.schema";
import { baseEntity } from "./helpers.schema";

export const orderItems = snakeCase.table("order_item", {
  ...baseEntity,
  orderId: uuid()
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid()
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  productName: text().notNull(),
  productSku: text().notNull(),
  quantity: integer().default(0).notNull(),
  unitPrice: numeric({ precision: 15, scale: 2 }).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
