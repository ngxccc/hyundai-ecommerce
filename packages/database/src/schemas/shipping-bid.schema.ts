import {
  boolean,
  numeric,
  snakeCase,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { orders } from "./order.schema";
import { sql } from "drizzle-orm";
import { baseEntity } from "./helpers.schema";

export const shippingBids = snakeCase.table(
  "shipping_bid",
  {
    ...baseEntity,
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    vendorName: text().notNull(),
    quotedPrice: numeric({ precision: 15, scale: 2 }).notNull(),
    internalNote: text(),
    isSelected: boolean().default(false),
  },
  (table) => [
    // one order is only have one bid
    uniqueIndex("one_selected_bid_order_idx")
      .on(table.orderId)
      .where(sql`${table.isSelected} = true`),
  ],
);

export type ShippingBid = typeof shippingBids.$inferSelect;
export type NewShippingBid = typeof shippingBids.$inferInsert;
