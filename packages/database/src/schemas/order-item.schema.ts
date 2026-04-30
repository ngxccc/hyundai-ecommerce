import { integer, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { orders } from "./order.schema";
import { products } from "./product.schema";
import { baseEntity } from "./helpers.schema";

export const orderItems = pgTable("order_item", {
  ...baseEntity,
  id: uuid().primaryKey().$defaultFn(uuidv7),
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
