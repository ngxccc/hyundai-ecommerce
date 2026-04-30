import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { orders } from "./order.schema";
import { relations, sql } from "drizzle-orm";

export const shippingBids = pgTable(
  "shipping_bid",
  {
    id: uuid("id").primaryKey().$defaultFn(uuidv7),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    vendorName: text("vendor_name").notNull(),
    quotedPrice: numeric("quoted_price", { precision: 15, scale: 2 }).notNull(),
    internalNote: text("internal_note"),
    isSelected: boolean("is_selected").default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // one order is only have one bid
    uniqueIndex("one_selected_bid_order_idx")
      .on(table.orderId)
      .where(sql`${table.isSelected} = true`),
  ],
);

export const shippingBidRelations = relations(shippingBids, ({ one }) => ({
  order: one(orders, {
    fields: [shippingBids.orderId],
    references: [orders.id],
  }),
}));

export type ShippingBid = typeof shippingBids.$inferSelect;
export type NewShippingBid = typeof shippingBids.$inferInsert;
