import {
  integer,
  numeric,
  pgEnum,
  snakeCase,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { products } from "./product.schema";
import { baseEntity } from "./helpers.schema";
import { orders } from "./order.schema";

export const quoteStatusEnum = pgEnum("quote_status", [
  "pending_review",
  "negotiating",
  "approved",
  "rejected",
  "expired",
]);

export const quotes = snakeCase.table("quote", {
  ...baseEntity,
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  status: quoteStatusEnum().notNull().default("pending_review"),
  totalQuotedPrice: numeric({ precision: 15, scale: 2 }),
  expirationDate: timestamp({ withTimezone: true, mode: "date" }),
  note: text(),
  orderId: uuid().references(() => orders.id, { onDelete: "set null" }),
});

export const quoteItems = snakeCase.table("quote_item", {
  ...baseEntity,
  quoteId: uuid()
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  productId: uuid()
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer().default(1).notNull(),
  requestedPrice: numeric({ precision: 15, scale: 2 }).notNull(),
  agreedPrice: numeric({ precision: 15, scale: 2 }),
});

export const quoteMessages = snakeCase.table("quote_message", {
  ...baseEntity,
  quoteId: uuid()
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  senderId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  message: text().notNull(),
});

export type TQuote = typeof quotes.$inferSelect;
export type TNewQuote = typeof quotes.$inferInsert;
export type TQuoteItem = typeof quoteItems.$inferSelect;
export type TNewQuoteItem = typeof quoteItems.$inferInsert;
export type TQuoteMessage = typeof quoteMessages.$inferSelect;
export type TNewQuoteMessage = typeof quoteMessages.$inferInsert;
