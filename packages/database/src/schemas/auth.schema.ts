import {
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  uuid,
  snakeCase,
  numeric,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { dealerTiers } from "./dealer-tier.schema";
import { fullEntity } from "./helpers.schema";

export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "SALES_REPRESENTATIVE",
  "ACCOUNTANT",
  "WAREHOUSE_MANAGER",
  "DEALER_APPROVER",
  "DEALER_PURCHASER",
  "CUSTOMER",
]);

export const businessTypeEnum = pgEnum("business_type", [
  "DEALER",
  "CONTRACTOR",
  "END_USER",
  "DISTRIBUTOR",
]);

export const users = snakeCase.table(
  "user",
  {
    ...fullEntity,
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().default(false).notNull(),
    image: text(),
    role: userRoleEnum().default("CUSTOMER").notNull(),
    dealerTierId: uuid().references(() => dealerTiers.id, {
      onDelete: "set null",
    }),
    parentId: uuid().references((): AnyPgColumn => users.id, {
      onDelete: "set null",
    }),
    phone: text().notNull().unique(),
    companyName: text(),
    taxId: text(),
    businessType: businessTypeEnum().default("END_USER").notNull(),
    province: text(),
    creditLimit: numeric({ precision: 15, scale: 2 }).default("0.00").notNull(),
    currentDebt: numeric({ precision: 15, scale: 2 }).default("0.00").notNull(),
  },
  (table) => [
    index("user_dealer_tier_idx").on(table.dealerTierId),
    index("user_parent_id_idx").on(table.parentId),
    index("user_created_at_idx").on(table.createdAt),
  ],
);

export const sessions = snakeCase.table(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const accounts = snakeCase.table(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verifications = snakeCase.table(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export type TUser = typeof users.$inferSelect;
export type TNewUser = typeof users.$inferInsert;
export type TSession = typeof sessions.$inferSelect;

export type UserRole = (typeof userRoleEnum.enumValues)[number];
