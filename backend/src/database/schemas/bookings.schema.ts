import {
  bigint,
  boolean,
  index,
  integer,
  primaryKey,
  snakeCase,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { bookingStatusEnum, discountTypeEnum } from "./enums.schema";
import { baseEntity } from "./helpers.schema";
import { shows, showSeats } from "./shows.schema";

export const vouchers = snakeCase.table("vouchers", {
  ...baseEntity,
  code: varchar({ length: 50 }).notNull().unique(),
  discountType: discountTypeEnum().notNull(),
  discountValue: integer().notNull(),
  minBookingAmount: integer().notNull().default(0),
  maxDiscountAmount: integer(),
  startDate: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  endDate: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  usageLimit: integer(),
  usageCount: integer().notNull().default(0),
});

export const bookings = snakeCase.table(
  "bookings",
  {
    ...baseEntity,
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    showId: uuid()
      .notNull()
      .references(() => shows.id, { onDelete: "restrict" }),
    voucherId: uuid().references(() => vouchers.id, {
      onDelete: "set null",
    }),
    originalPrice: integer().notNull(),
    discountPrice: integer().notNull().default(0),
    totalPrice: integer().notNull(),
    status: bookingStatusEnum().default("pending_payment").notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    orderCode: bigint({ mode: "number" }),
  },
  (table) => [
    uniqueIndex("bookings_order_code_uidx").on(table.orderCode),
    index("bookings_user_id_created_at_idx").on(
      table.userId,
      table.createdAt.desc(),
    ),
    index("bookings_show_id_idx").on(table.showId),
    index("bookings_voucher_id_idx").on(table.voucherId),
    index("bookings_status_expires_at_idx").on(table.status, table.expiresAt),
  ],
);

export const tickets = snakeCase.table(
  "tickets",
  {
    ...baseEntity,
    bookingId: uuid()
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    showSeatId: uuid()
      .notNull()
      .references(() => showSeats.id, { onDelete: "restrict" }),
    ticketCode: varchar({ length: 100 }).notNull().unique(),
    finalPrice: integer().notNull(),
  },
  (table) => [
    uniqueIndex("tickets_ticket_code_uidx").on(table.ticketCode),
    uniqueIndex("tickets_booking_id_show_seat_id_uidx").on(
      table.bookingId,
      table.showSeatId,
    ),
    index("tickets_show_seat_id_idx").on(table.showSeatId),
  ],
);

export const combos = snakeCase.table("combos", {
  ...baseEntity,
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  price: integer().notNull(),
  isActive: boolean().default(true).notNull(),
});

export const bookingCombos = snakeCase.table(
  "booking_combos",
  {
    bookingId: uuid()
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    comboId: uuid()
      .notNull()
      .references(() => combos.id, { onDelete: "restrict" }),
    quantity: integer().default(1).notNull(),
  },
  (table) => [primaryKey({ columns: [table.bookingId, table.comboId] })],
);
export type Voucher = typeof vouchers.$inferSelect;
export type NewVoucher = typeof vouchers.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Combo = typeof combos.$inferSelect;
export type NewCombo = typeof combos.$inferInsert;
export type BookingCombo = typeof bookingCombos.$inferSelect;
export type NewBookingCombo = typeof bookingCombos.$inferInsert;
