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

export type UserAddress = typeof userAddresses.$inferSelect;
export type NewUserAddress = typeof userAddresses.$inferInsert;

export type AddressDTO = Omit<
  UserAddress,
  "userId" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type CreateAddressDTO = Omit<AddressDTO, "id" | "isDefault"> & {
  userId: string;
  isDefault?: boolean;
};

export type UpdateAddressDTO = Partial<Omit<AddressDTO, "id">>;
