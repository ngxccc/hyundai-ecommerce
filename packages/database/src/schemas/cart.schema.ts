import { snakeCase, uuid } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";
import { users } from "./auth.schema";

export const carts = snakeCase.table("cart", {
  ...baseEntity,
  // HACK: Nullable userId để hỗ trợ Guest Cart
  // NOTE: cần xử lý logic merge cart khi user đăng nhập
  userId: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
});

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
