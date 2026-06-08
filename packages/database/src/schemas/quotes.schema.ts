import {
  integer,
  numeric,
  pgEnum,
  snakeCase,
  text,
  timestamp,
  uuid,
  index,
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

export const quotes = snakeCase.table(
  "quote",
  {
    ...baseEntity,
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: quoteStatusEnum().notNull().default("pending_review"),
    totalQuotedPrice: numeric({ precision: 15, scale: 2 }),
    expirationDate: timestamp({ withTimezone: true, mode: "date" }),
    note: text(),
    orderId: uuid().references(() => orders.id, { onDelete: "set null" }),
  },
  (table) => [
    index("quote_user_idx").on(table.userId),
    index("quote_order_idx").on(table.orderId),
    index("quote_created_at_idx").on(table.createdAt),
  ],
);

export const quoteItems = snakeCase.table(
  "quote_item",
  {
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
  },
  (table) => [
    index("quote_item_quote_idx").on(table.quoteId),
    index("quote_item_product_idx").on(table.productId),
  ],
);

export const quoteMessages = snakeCase.table(
  "quote_message",
  {
    ...baseEntity,
    quoteId: uuid()
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    senderId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    message: text().notNull(),
  },
  (table) => [
    index("quote_message_quote_idx").on(table.quoteId),
    index("quote_message_sender_idx").on(table.senderId),
  ],
);

export type TQuote = typeof quotes.$inferSelect;
export type TNewQuote = typeof quotes.$inferInsert;
export type TQuoteItem = typeof quoteItems.$inferSelect;
export type TNewQuoteItem = typeof quoteItems.$inferInsert;
export type TQuoteMessage = typeof quoteMessages.$inferSelect;
export type TNewQuoteMessage = typeof quoteMessages.$inferInsert;
