import { boolean, index, snakeCase, text, uuid } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";
import { users } from "./auth.schema";

export const userAddresses = snakeCase.table(
  "user_address",
  {
    ...baseEntity,
    userId: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    receiverName: text().notNull(),
    phoneNumber: text().notNull(),
    streetAddress: text().notNull(),
    district: text().notNull(),
    city: text().notNull(),
    isDefault: boolean().default(false).notNull(),
  },
  (table) => [
    index("user_address_user_id_idx").on(table.userId),
    index("user_address_default_idx").on(table.userId, table.isDefault),
  ],
);

export type UserAddress = typeof userAddresses.$inferSelect;
export type NewUserAddress = typeof userAddresses.$inferInsert;
