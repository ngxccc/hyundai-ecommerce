import {
  index,
  integer,
  snakeCase,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.schema";
import { paymentMethodEnum, paymentStatusEnum } from "./enums.schema";
import { baseEntity } from "./helpers.schema";

export const payments = snakeCase.table(
  "payments",
  {
    ...baseEntity,
    bookingId: uuid()
      .notNull()
      .references(() => bookings.id, { onDelete: "restrict" }),
    paymentMethod: paymentMethodEnum().notNull(),
    transactionId: varchar({ length: 255 }),
    amount: integer().notNull(),
    status: paymentStatusEnum().notNull(),
  },
  (table) => [
    uniqueIndex("payments_transaction_id_uidx").on(table.transactionId),
    index("payments_booking_id_idx").on(table.bookingId),
  ],
);
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
