import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { fullEntity } from "./helpers.schema";
import { users } from "./auth.schema";

export const userAddresses = pgTable("user_address", {
  ...fullEntity,
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

export type UserAddress = typeof userAddresses.$inferSelect;
export type NewUserAddress = typeof userAddresses.$inferInsert;
