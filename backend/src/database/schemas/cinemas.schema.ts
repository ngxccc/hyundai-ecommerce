import {
  decimal,
  index,
  integer,
  snakeCase,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseEntity, primaryKeyUuid } from "./helpers.schema";

export const cinemas = snakeCase.table(
  "cinemas",
  {
    ...baseEntity,
    name: varchar({ length: 255 }).notNull(),
    city: varchar({ length: 100 }).notNull(),
    ward: varchar({ length: 100 }).notNull(),
    streetAddress: varchar({ length: 255 }).notNull(),
    postalCode: varchar({ length: 10 }),
    latitude: decimal({ precision: 10, scale: 8 }),
    longitude: decimal({ precision: 11, scale: 8 }),
  },
  (table) => [
    index("cinemas_city_ward_idx").on(table.city, table.ward),
    index("cinemas_name_idx").on(table.name),
  ],
);

export const halls = snakeCase.table(
  "halls",
  {
    ...baseEntity,
    cinemaId: uuid()
      .notNull()
      .references(() => cinemas.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    totalSeats: integer().notNull().default(0),
  },
  (table) => [index("halls_cinema_id_idx").on(table.cinemaId)],
);

export const seatTypes = snakeCase.table("seat_types", {
  ...primaryKeyUuid,
  name: varchar({ length: 50 }).notNull().unique(),
  priceMultiplier: decimal({ precision: 4, scale: 2 })
    .notNull()
    .default("1.00"),
});

export const seats = snakeCase.table(
  "seats",
  {
    ...baseEntity,
    hallId: uuid()
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    seatTypeId: uuid()
      .notNull()
      .references(() => seatTypes.id, { onDelete: "restrict" }),
    row: varchar({ length: 10 }).notNull(),
    number: integer().notNull(),
    seatNumber: varchar({ length: 20 }).notNull(),
  },
  (table) => [
    uniqueIndex("seats_hall_id_seat_number_uidx").on(
      table.hallId,
      table.seatNumber,
    ),
    index("seats_seat_type_id_idx").on(table.seatTypeId),
  ],
);

export type Cinema = typeof cinemas.$inferSelect;
export type NewCinema = typeof cinemas.$inferInsert;
export type Hall = typeof halls.$inferSelect;
export type NewHall = typeof halls.$inferInsert;
export type SeatType = typeof seatTypes.$inferSelect;
export type NewSeatType = typeof seatTypes.$inferInsert;
export type Seat = typeof seats.$inferSelect;
export type NewSeat = typeof seats.$inferInsert;
