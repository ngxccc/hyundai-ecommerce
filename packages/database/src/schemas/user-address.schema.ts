import { boolean, snakeCase, text, uuid } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";
import { users } from "./auth.schema";

export const userAddresses = snakeCase.table("user_address", {
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
});

export type TUserAddress = typeof userAddresses.$inferSelect;
export type TNewUserAddress = typeof userAddresses.$inferInsert;
