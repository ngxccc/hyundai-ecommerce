import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  snakeCase,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseEntity, fullEntity } from "./helpers.schema";
import { users } from "./auth.schema";
import { products } from "./product.schema";
import { orders } from "./order.schema";
import { quoteStatusEnum } from "./enums.schema";

export const quotes = snakeCase.table(
  "quote",
  {
    ...fullEntity,
    quoteNumber: varchar({ length: 32 }),
    userId: uuid().references(() => users.id, { onDelete: "set null" }),
    customerName: varchar({ length: 255 }),
    customerPhone: varchar({ length: 20 }),
    customerEmail: varchar({ length: 255 }),
    companyName: varchar({ length: 255 }),
    taxId: varchar({ length: 50 }),
    shippingAddress: text(),
    status: quoteStatusEnum().notNull().default("DRAFT"),
    subtotalPrice: numeric({ precision: 15, scale: 2 }).default("0.00"),
    vatRate: integer().default(10),
    vatAmount: numeric({ precision: 15, scale: 2 }).default("0.00"),
    totalQuotedPrice: numeric({ precision: 15, scale: 2 }),
    commercialTerms: jsonb().$type<{
      validityDays?: number | null | undefined;
      paymentSchedule?: string | null | undefined;
      warrantyTerms?: string | null | undefined;
      deliveryTime?: string | null | undefined;
      deliveryLocation?: string | null | undefined;
    } | null>(),
    expirationDate: timestamp({ withTimezone: true, mode: "date" }),
    note: text(),
    orderId: uuid().references(() => orders.id, { onDelete: "set null" }),
    createdByAdminId: uuid().references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("quote_user_idx").on(table.userId),
    index("quote_order_idx").on(table.orderId),
    index("quote_created_at_idx").on(table.createdAt),
    index("quote_customer_phone_idx").on(table.customerPhone),
  ],
);

export const quoteItems = snakeCase.table(
  "quote_item",
  {
    ...baseEntity,
    quoteId: uuid()
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    productId: uuid().references(() => products.id, { onDelete: "set null" }),
    isCustomItem: boolean().default(false).notNull(),
    itemName: varchar({ length: 255 }),
    itemModel: varchar({ length: 100 }),
    itemSpecs: text(),
    quantity: integer().default(1).notNull(),
    unitPrice: numeric({ precision: 15, scale: 2 }),
    discountPercent: numeric({ precision: 5, scale: 2 }).default("0.00"),
    finalUnitPrice: numeric({ precision: 15, scale: 2 }),
    totalPrice: numeric({ precision: 15, scale: 2 }),
    requestedPrice: numeric({ precision: 15, scale: 2 }),
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

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;
export type QuoteMessage = typeof quoteMessages.$inferSelect;
export type NewQuoteMessage = typeof quoteMessages.$inferInsert;
