import { snakeCase, uuid, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";
import { users } from "./auth.schema";
import { products, type Product } from "./product.schema";

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
  ],
);

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export const CART_ITEM_COLUMNS = {
  id: true,
  productId: true,
  quantity: true,
} as const;

export const CART_ITEM_PRODUCT_COLUMNS = {
  id: true,
  nameVi: true,
  nameEn: true,
  price: true,
  images: true,
  totalStockCache: true,
  slug: true,
} as const;

export type CartItemMinimal = {
  [K in keyof typeof CART_ITEM_COLUMNS]: CartItem[K];
};

export type CartItemProductMinimal = {
  [K in keyof typeof CART_ITEM_PRODUCT_COLUMNS]: Product[K];
};

export type CartItemDTO = CartItemMinimal & {
  product: CartItemProductMinimal | null;
};
