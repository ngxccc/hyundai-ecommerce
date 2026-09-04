import {
  boolean,
  index,
  numeric,
  snakeCase,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { businessTypeEnum, userRoleEnum, userStatusEnum } from "./enums.schema";
import { dealerTiers } from "./dealer-tier.schema";
import { baseEntity, fullEntity } from "./helpers.schema";

export const users = snakeCase.table(
  "users",
  {
    ...fullEntity,
    fullName: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    phoneNumber: varchar({ length: 20 }).notNull(),
    avatarUrl: text(),
    passwordHash: text().notNull(),
    role: userRoleEnum().default("SALES").notNull(),
    status: userStatusEnum().default("ACTIVE").notNull(),
    emailVerified: boolean().default(false).notNull(),

    // B2B & Dealer Hierarchy
    dealerTierId: uuid().references(() => dealerTiers.id, {
      onDelete: "set null",
    }),
    parentId: uuid().references((): AnyPgColumn => users.id, {
      onDelete: "set null",
    }),
    companyName: text(),
    taxId: text(),
    businessType: businessTypeEnum().default("END_USER").notNull(),
    province: text(),
    creditLimit: numeric({ precision: 15, scale: 2 }).default("0.00").notNull(),
    currentDebt: numeric({ precision: 15, scale: 2 }).default("0.00").notNull(),

    // Verification & Password Reset
    verificationToken: varchar({ length: 255 }),
    verificationExpiresAt: timestamp({ withTimezone: true, mode: "date" }),
    resetPasswordToken: varchar({ length: 255 }),
    resetPasswordExpiresAt: timestamp({ withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("users_email_uidx").on(table.email),
    uniqueIndex("users_phone_uidx").on(table.phoneNumber),
    index("users_dealer_tier_idx").on(table.dealerTierId),
    index("users_parent_id_idx").on(table.parentId),
    index("users_role_idx").on(table.role),
    index("users_status_idx").on(table.status),
    index("users_created_at_idx").on(table.createdAt),
  ],
);

export const refreshTokens = snakeCase.table(
  "refresh_tokens",
  {
    ...baseEntity,
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar({ length: 255 }).notNull(),
    deviceName: varchar({ length: 255 }),
    ipAddress: varchar({ length: 45 }),
    expiresAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    isRevoked: boolean().default(false).notNull(),
  },
  (table) => [
    uniqueIndex("refresh_tokens_token_hash_uidx").on(table.tokenHash),
    index("refresh_tokens_user_id_idx").on(table.userId),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
