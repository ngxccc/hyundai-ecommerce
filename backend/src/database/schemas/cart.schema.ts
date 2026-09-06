import {
  check,
  index,
  integer,
  snakeCase,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { baseEntity } from "./helpers.schema";
import { users } from "./auth.schema";
import { products } from "./product.schema";

export const carts = snakeCase.table("cart", {
  ...baseEntity,
  userId: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
});

export const cartItems = snakeCase.table(
  "cart_item",
  {
    ...baseEntity,
    cartId: uuid()
      .references(() => carts.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid()
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    quantity: integer().notNull().default(1),
  },
  (table) => [
    uniqueIndex("cart_product_unique_idx").on(table.cartId, table.productId),
    index("cart_item_product_id_idx").on(table.productId),
    check("cart_item_quantity_positive_chk", sql`${table.quantity} > 0`),
  ],
);

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
