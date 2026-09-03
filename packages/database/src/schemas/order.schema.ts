import {
  boolean,
  index,
  numeric,
  pgEnum,
  snakeCase,
  text,
  uniqueIndex,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  ORDER_PAYMENT_STATUSES,
  APPROVAL_STATUSES,
  type OrderStatus,
  type PaymentMethod,
  type OrderPaymentStatus,
  type ApprovalStatus,
} from "@nhatnang/core";
import type { Payment } from "./payment.schema";
import { users } from "./auth.schema";
import { baseEntity } from "./helpers.schema";
import { products } from "./product.schema";
import { sql } from "drizzle-orm";

export const orderStatusEnum = pgEnum("order_status", ORDER_STATUSES);

export const paymentMethodEnum = pgEnum("payment_method", PAYMENT_METHODS);

export const orderPaymentStatusEnum = pgEnum(
  "order_payment_status",
  ORDER_PAYMENT_STATUSES,
);

export const approvalStatusEnum = pgEnum("approval_status", APPROVAL_STATUSES);

export const orders = snakeCase.table(
  "order",
  {
    ...baseEntity,
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: orderStatusEnum().notNull().default("PENDING"),
    shippingFee: numeric({ precision: 15, scale: 2 }).notNull(),
    shippingAddress: text().notNull(),
    totalAmount: numeric({ precision: 15, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum().notNull().default("PAYOS"),
    paymentStatus: orderPaymentStatusEnum().notNull().default("UNPAID"),
    approvalStatus: approvalStatusEnum().notNull().default("APPROVED"),
  },
  (table) => [
    index("order_user_status_created_idx").on(
      table.userId,
      table.status,
      table.createdAt,
    ),
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

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

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

export type CreateOrderDTO = Pick<
  Order,
  "userId" | "shippingAddress" | "shippingFee" | "totalAmount" | "paymentMethod"
> &
  Partial<Pick<Order, "paymentStatus" | "status" | "approvalStatus">> & {
    orderCode?: string;
  };

export type CreateOrderItemDTO = Pick<
  OrderItem,
  "productId" | "productName" | "productSku" | "quantity" | "unitPrice"
>;

export type CreatePaymentDTO = Pick<Payment, "orderId" | "amount" | "method"> &
  Partial<Pick<Payment, "status" | "rawPayload">>;
export type { PaymentMethod, OrderPaymentStatus, OrderStatus, ApprovalStatus };
