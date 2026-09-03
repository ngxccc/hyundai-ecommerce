import {
  boolean,
  index,
  snakeCase,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { userRoleEnum, userStatusEnum } from "./enums.schema";
import { baseEntity } from "./helpers.schema";

export const users = snakeCase.table(
  "users",
  {
    ...baseEntity,
    email: varchar({ length: 255 }).notNull(),
    fullName: varchar({ length: 255 }).notNull(),
    phoneNumber: varchar({ length: 20 }),
    avatarUrl: text(),

    // Local Authentication (Nullable for OAuth users)
    passwordHash: text(),

    // OAuth Providers (Nullable, unique constraints)
    googleId: varchar({ length: 255 }),
    facebookId: varchar({ length: 255 }),

    // Authorization & Account Lifecycle
    role: userRoleEnum().default("user").notNull(),
    status: userStatusEnum().default("pending_verification").notNull(),

    verificationToken: varchar({ length: 255 }),
    verificationExpiresAt: timestamp({ withTimezone: true, mode: "date" }),

    resetPasswordToken: varchar({ length: 255 }),
    resetPasswordExpiresAt: timestamp({ withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("users_email_uidx").on(table.email),
    uniqueIndex("users_google_id_uidx").on(table.googleId),
    uniqueIndex("users_facebook_id_uidx").on(table.facebookId),
    uniqueIndex("users_verification_token_uidx").on(table.verificationToken),
    index("users_verification_expires_at_idx")
      .on(table.verificationExpiresAt)
      .where(sql`${table.status} = 'pending_verification'`),
    uniqueIndex("users_reset_password_token_uidx").on(table.resetPasswordToken),
    index("users_reset_password_expires_at_idx")
      .on(table.resetPasswordExpiresAt)
      .where(sql`${table.resetPasswordToken} IS NOT NULL`),
    index("users_phone_number_idx").on(table.phoneNumber),
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
