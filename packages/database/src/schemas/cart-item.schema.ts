import { integer, snakeCase, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";
import { carts } from "./cart.schema";
import { products } from "./product.schema";

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
  ],
);

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
