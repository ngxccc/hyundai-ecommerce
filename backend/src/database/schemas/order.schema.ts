import {
  boolean,
  index,
  integer,
  numeric,
  snakeCase,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { baseEntity, fullEntity } from "./helpers.schema";
import { users } from "./auth.schema";
import { products } from "./product.schema";
import { leads } from "./leads.schema";
import {
  approvalStatusEnum,
  orderPaymentStatusEnum,
  orderStatusEnum,
  paymentMethodEnum,
} from "./enums.schema";

export const orders = snakeCase.table(
  "order",
  {
    ...fullEntity,
    orderNumber: varchar({ length: 32 }),
    userId: uuid().references(() => users.id, { onDelete: "set null" }),
    leadId: uuid().references(() => leads.id, { onDelete: "set null" }),
    customerName: varchar({ length: 255 }),
    customerPhone: varchar({ length: 20 }),
    customerEmail: varchar({ length: 255 }),
    companyName: varchar({ length: 255 }),
    status: orderStatusEnum().notNull().default("PENDING"),
    shippingFee: numeric({ precision: 15, scale: 2 }).notNull().default("0.00"),
    shippingAddress: text().notNull(),
    totalAmount: numeric({ precision: 15, scale: 2 }).notNull(),
    depositAmount: numeric({ precision: 15, scale: 2 }).default("0.00"),
    remainingAmount: numeric({ precision: 15, scale: 2 }).default("0.00"),
    paymentMethod: paymentMethodEnum().notNull().default("PAYOS"),
    paymentStatus: orderPaymentStatusEnum().notNull().default("PENDING"),
    approvalStatus: approvalStatusEnum().notNull().default("APPROVED"),
    approvedBy: uuid().references(() => users.id, { onDelete: "set null" }),
    note: text(),
  },
  (table) => [
    index("order_user_status_created_idx").on(
      table.userId,
      table.status,
      table.createdAt,
    ),
    index("order_lead_idx").on(table.leadId),
    index("order_customer_phone_idx").on(table.customerPhone),
    index("order_order_number_idx").on(table.orderNumber),
    index("order_active_metrics_idx")
      .on(table.createdAt)
      .where(sql`${table.status} != 'CANCELLED'`),
  ],
);

export const orderItems = snakeCase.table(
  "order_item",
  {
    ...baseEntity,
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productName: text().notNull(),
    productSku: text().notNull(),
    quantity: integer().default(0).notNull(),
    unitPrice: numeric({ precision: 15, scale: 2 }).notNull(),
  },
  (table) => [
    index("order_item_order_idx").on(table.orderId),
    index("order_item_product_idx").on(table.productId),
  ],
);

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
    uniqueIndex("one_selected_bid_order_idx")
      .on(table.orderId)
      .where(sql`${table.isSelected} = true`),
  ],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type ShippingBid = typeof shippingBids.$inferSelect;
export type NewShippingBid = typeof shippingBids.$inferInsert;
